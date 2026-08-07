import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import sgMail from '@sendgrid/mail';
import type { Express, Request, RequestHandler } from 'express';
import connectPg from 'connect-pg-simple';
import { isAllowedTrainingLevel } from "@shared/trainingLevels";
import {
  DEFAULT_SPECIALTY_ID,
  getSpecialty,
  isSpecialtyId,
  type SpecialtyId,
} from "@shared/specialties";
import { storage } from './storage';
import { getCanonicalOriginForHost, getSpecialtyForHost, requestHostname } from './seoPublic';
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

const DEFAULT_PASSWORD_RESET_TEMPLATE_ID = 'd-c1a8296876d045eb8ca21c193f321224';

function hashPasswordResetToken(plainToken: string): string {
  return createHash('sha256').update(plainToken, 'utf8').digest('hex');
}

function generatePasswordResetPlainToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Base URL for emailed links. Derived from the request host so a reset started on
 * ortho-atlas.com links back to ortho-atlas.com. APP_URL still forces one origin.
 */
function appBaseUrl(req?: Request): string {
  const forced = process.env.APP_URL?.trim();
  if (forced) return forced.replace(/\/$/, '');
  const host = req ? requestHostname(req) : '';
  const fromHost = getCanonicalOriginForHost(host);
  if (fromHost) return fromHost.replace(/\/$/, '');
  return getSpecialty(DEFAULT_SPECIALTY_ID).canonicalOrigin;
}

/**
 * Sends only a reset link — never the user's password. Update the SendGrid dynamic template to use
 * {{{resetUrl}}} (and optionally {{{loginUrl}}}); do not pass passwords to SendGrid.
 */
async function sendPasswordResetEmail(email: string, resetUrl: string, base: string): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@prs-atlas.com';

  if (!apiKey) {
    console.warn('[Forgot password] SENDGRID_API_KEY is not set — no email will be sent.');
    return;
  }

  const templateId =
    process.env.SENDGRID_PASSWORD_RESET_TEMPLATE_ID || DEFAULT_PASSWORD_RESET_TEMPLATE_ID;

  try {
    sgMail.setApiKey(apiKey);
    await sgMail.send({
      to: email,
      from: fromEmail,
      templateId,
      dynamicTemplateData: {
        resetUrl,
        loginUrl: `${base}/login`,
      },
    });
  } catch (error: unknown) {
    const err = error as { response?: { body?: unknown; statusCode?: number } };
    console.error('[Forgot password] SendGrid error:', err);
    if (err.response?.body) {
      console.error('[Forgot password] SendGrid response body:', JSON.stringify(err.response.body, null, 2));
    }
    if (err.response?.statusCode) {
      console.error('[Forgot password] SendGrid status code:', err.response.statusCode);
    }
    throw error;
  }
}

const REPORT_SUPPORT_EMAIL = 'support@prs-atlas.com';

export async function sendReportQuestionEmail(
  questionId: string,
  message: string,
  userEmail?: string | null
): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@prs-atlas.com';

  if (!apiKey) {
    console.warn('[Report question] SENDGRID_API_KEY is not set — no email will be sent. Question ID:', questionId);
    return;
  }

  const body = `A question has been reported.\n\nQuestion ID: ${questionId}\n\nReport:\n${message}${userEmail ? `\n\nReported by: ${userEmail}` : '\n\n(Submitted anonymously)'}`;

  try {
    sgMail.setApiKey(apiKey);
    await sgMail.send({
      to: REPORT_SUPPORT_EMAIL,
      from: fromEmail,
      subject: 'Question Reported',
      text: body,
    });
    console.log('[Report question] Email sent to', REPORT_SUPPORT_EMAIL, 'for question', questionId);
  } catch (error: unknown) {
    const err = error as { response?: { body?: unknown; statusCode?: number } };
    console.error('[Report question] SendGrid error:', err);
    if (err.response?.body) {
      console.error('[Report question] SendGrid response body:', JSON.stringify(err.response.body, null, 2));
    }
    throw error;
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

      if (!user.passwordHash) {
        return res.json({ message: 'If an account exists with that email, a password recovery email has been sent.' });
      }

      if (!process.env.SENDGRID_API_KEY) {
        console.warn('[Forgot password] SENDGRID_API_KEY is not set — reset email will not be sent.');
        return res.json({ message: 'If an account exists with that email, a password recovery email has been sent.' });
      }

      const plainToken = generatePasswordResetPlainToken();
      const tokenHash = hashPasswordResetToken(plainToken);
      const ttlMs = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MS) || 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + ttlMs);

      await storage.deletePasswordResetTokensForUser(user.id);
      await storage.createPasswordResetToken(user.id, tokenHash, expiresAt);

      const base = appBaseUrl(req);
      const resetUrl = `${base}/reset-password?token=${encodeURIComponent(plainToken)}`;

      try {
        await sendPasswordResetEmail(email, resetUrl, base);
      } catch (err) {
        console.error('Failed to send password reset email:', err);
        await storage.deletePasswordResetTokensForUser(user.id);
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
          return res.status(500).json({ message: 'Session Creation Failed.' });
        }
        res.json({ success: true, user: sanitizeUser(user), passwordNeedsReset: user.passwordNeedsReset || false });
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Login Failed.' });
    }
  });

  // Complete password reset using the link from email (no session required)
  app.post('/api/auth/complete-password-reset', authRateLimiter, async (req, res) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || typeof token !== 'string' || token.length > 512) {
        return res.status(400).json({ message: 'Invalid or expired reset link.' });
      }

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

      const tokenHash = hashPasswordResetToken(token);
      const userId = await storage.takePasswordResetToken(tokenHash);
      if (!userId) {
        return res.status(400).json({
          message: 'Invalid or expired reset link. Request a new one from the login page.',
        });
      }

      const passwordHash = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, passwordHash, false);

      res.json({ success: true, message: 'Password reset successfully. You can sign in now.' });
    } catch (error) {
      console.error('Complete password reset error:', error);
      res.status(500).json({ message: 'Failed to reset password.' });
    }
  });

  // Change password route (settings, or after login with temporary password)
  app.post('/api/auth/change-password', async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'New password and confirmation required.' });
      }

      if (!user.passwordNeedsReset) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required.' });
        }
        if (!user.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
          return res.status(401).json({ message: 'Current password is incorrect.' });
        }
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
      res.status(500).json({ message: 'Failed to change password.' });
    }
  });

  // Register route
  app.post('/api/auth/register', authRateLimiter, async (req, res) => {
    try {
      const { email, password, confirmPassword, firstName, lastName, institutionalAffiliation, trainingLevel, specialtyId } =
        req.body;

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

      if (typeof trainingLevel !== 'string' || !isAllowedTrainingLevel(trainingLevel)) {
        return res.status(400).json({ message: 'Please select a valid training level.' });
      }

      /** Signup picker defaults to the host's specialty but the client may send the other one. */
      if (specialtyId != null && !isSpecialtyId(specialtyId)) {
        return res.status(400).json({ message: 'Please select a valid specialty.' });
      }
      const signupSpecialtyId: SpecialtyId = isSpecialtyId(specialtyId)
        ? specialtyId
        : getSpecialtyForHost(requestHostname(req));

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

      // Create user (no trial; they must go to subscription page to choose a plan or use institutional code)
      const passwordHash = await hashPassword(password);

      const newUser = await storage.upsertUser({
        email,
        passwordHash,
        firstName,
        lastName,
        institutionalAffiliation: institutionalAffiliation || '',
        trainingLevel,
        subscriptionStatus: 'expired',
        trialEndsAt: null,
        signupSpecialtyId,
        activeSpecialtyId: signupSpecialtyId,
      });

      /** Locked entitlement row for the chosen q-bank only; the other one is created on demand. */
      await storage.updateSpecialtyEntitlement(newUser.id, signupSpecialtyId, {
        subscriptionStatus: 'expired',
        trialEndsAt: null,
      });

      // Create session (store only sanitized user; never persist passwordHash in session)
      (req as any).session.userId = newUser.id;
      (req as any).session.user = sanitizeUser(newUser);
      (req as any).user = newUser;

      // Save session before responding
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session creation failed.' });
        }
        res.status(201).json({ success: true, user: sanitizeUser(newUser) });
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Registration failed.' });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed.' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const session = (req as any).session;

  if (!session?.userId) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  // Verify user still exists
  const currentUser = await storage.getUser(session.userId);
  if (!currentUser) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  // Attach user to request for use in route handlers
  (req as any).user = currentUser;

  next();
};
