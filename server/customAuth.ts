import bcrypt from 'bcrypt';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import sgMail from '@sendgrid/mail';
import type { Express, RequestHandler } from 'express';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';
import { sanitizeUser } from './authUtils';

const SALT_ROUNDS = 12; // Strong password hashing
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('SESSION_SECRET must be set in production. Do not use a default secret.');
  }
  return secret || 'atlas-review-secret';
}

export function getSession() {
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: SESSION_TTL / 1000, // convert to seconds
    tableName: 'sessions',
  });

  return session({
    secret: getSessionSecret(),
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: SESSION_TTL,
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateTemporaryPassword(): string {
  // Generate a 12-character temporary password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendPasswordEmail(email: string, password: string): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@prs-atlas.com';

  if (!apiKey) {
    console.warn('[Forgot password] SENDGRID_API_KEY is not set — no email will be sent. Recipient:', email);
    return;
  }

  try {
    sgMail.setApiKey(apiKey);
    console.log('[Forgot password] Sending via SendGrid to', email, 'from', fromEmail);
    await sgMail.send({
      to: email,
      from: fromEmail,
      templateId: 'd-c1a8296876d045eb8ca21c193f321224',
      dynamicTemplateData: {
        temporaryPassword: password,
        loginUrl: process.env.APP_URL || 'https://prs-atlas.com',
      },
    });
    console.log('[Forgot password] SendGrid accepted the request for', email);
  } catch (error: unknown) {
    const err = error as { response?: { body?: unknown; statusCode?: number } };
    console.error('[Forgot password] SendGrid error:', err);
    if (err.response?.body) {
      console.error('[Forgot password] SendGrid response body:', JSON.stringify(err.response.body, null, 2));
    }
    if (err.response?.statusCode) {
      console.error('[Forgot password] SendGrid status code:', err.response.statusCode);
    }
  }
}

/** Rate limiter for auth-sensitive endpoints (login, register, forgot-password) to prevent brute force. */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // 25 attempts per window per IP across login + register + forgot-password
  message: { message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function setupAuth(app: Express) {
  app.set('trust proxy', 1);
  app.use(getSession());

  // Forgot password route
  app.post('/api/auth/forgot-password', authRateLimiter, async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required to retrieve password.' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not (security best practice)
        return res.json({ message: 'If an account exists with that email, a password recovery email has been sent.' });
      }

      // Generate temporary password
      const temporaryPassword = generateTemporaryPassword();
      const tempPasswordHash = await hashPassword(temporaryPassword);

      // Update user with temporary password and set flag
      await storage.updateUserPassword(user.id, tempPasswordHash, true);

      // Send email with temporary password
      try {
        await sendPasswordEmail(email, temporaryPassword);
      } catch (err) {
        console.error('Failed to send password email:', err);
      }

      return res.json({ message: 'If an account exists with that email, a password recovery email has been sent.' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
  });

  // Login route
  app.post('/api/auth/login', authRateLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required to login.' });
      }
      if (password.length > 128) {
        return res.status(400).json({ message: 'Invalid email or password entered.' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: 'Invalid email or password entered.' });
      }

      const isPasswordValid = await verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password entered.' });
      }

      // Create session (store only sanitized user; never persist passwordHash in session)
      (req as any).session.userId = user.id;
      (req as any).session.user = sanitizeUser(user);
      (req as any).user = user;

      // Save session before responding
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('Session Save Error:', err);
          return res.status(500).json({ message: 'Session Creation Failed' });
        }
        res.json({ success: true, user: sanitizeUser(user), passwordNeedsReset: user.passwordNeedsReset || false });
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Login Failed' });
    }
  });

  // Change password route (used after login with temporary password)
  app.post('/api/auth/change-password', async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { newPassword, confirmPassword } = req.body;

      if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'New password and confirmation required.' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least eight characters in length.' });
      }
      if (newPassword.length > 128) {
        return res.status(400).json({ message: 'Password must be at most 128 characters.' });
      }

      // Hash new password and update user
      const passwordHash = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, passwordHash, false);

      res.json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  });

  // Register route
  app.post('/api/auth/register', authRateLimiter, async (req, res) => {
    try {
      const { email, password, confirmPassword, firstName, lastName, institutionalAffiliation } = req.body;

      // Validation
      if (!email || !password || !confirmPassword || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields required.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: 'Password must be at least eight characters in length.' });
      }
      if (password.length > 128) {
        return res.status(400).json({ message: 'Password must be at most 128 characters.' });
      }

      const MAX_EMAIL = 255;
      const MAX_NAME = 100;
      const MAX_AFFILIATION = 255;
      if (typeof email !== 'string' || email.length > MAX_EMAIL) {
        return res.status(400).json({ message: 'Invalid email.' });
      }
      if (typeof firstName !== 'string' || firstName.length > MAX_NAME || typeof lastName !== 'string' || lastName.length > MAX_NAME) {
        return res.status(400).json({ message: 'First and last name must be at most 100 characters each.' });
      }
      if (institutionalAffiliation != null && (typeof institutionalAffiliation !== 'string' || institutionalAffiliation.length > MAX_AFFILIATION)) {
        return res.status(400).json({ message: 'Institutional affiliation must be at most 255 characters.' });
      }

      // Check email validity
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format, please try again.' });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered, please login instead.' });
      }

      // Create user
      const passwordHash = await hashPassword(password);
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);

      const newUser = await storage.upsertUser({
        email,
        passwordHash,
        firstName,
        lastName,
        institutionalAffiliation: institutionalAffiliation || '',
        subscriptionStatus: 'trial',
        trialEndsAt,
      });

      // Create session (store only sanitized user; never persist passwordHash in session)
      (req as any).session.userId = newUser.id;
      (req as any).session.user = sanitizeUser(newUser);
      (req as any).user = newUser;

      // Save session before responding
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session creation failed' });
        }
        res.status(201).json({ success: true, user: sanitizeUser(newUser) });
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const session = (req as any).session;

  if (!session?.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Verify user still exists
  const currentUser = await storage.getUser(session.userId);
  if (!currentUser) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Attach user to request for use in route handlers
  (req as any).user = currentUser;

  next();
};
