import bcrypt from 'bcrypt';
import session from 'express-session';
import type { Express, RequestHandler } from 'express';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';

const SALT_ROUNDS = 12; // Strong password hashing
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getSession() {
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: SESSION_TTL / 1000, // convert to seconds
    tableName: 'sessions',
  });

  return session({
    secret: process.env.SESSION_SECRET || 'atlas-review-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Prevent XSS attacks
      secure: true, // HTTPS only
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
  // Note: For production, integrate with SendGrid via SENDGRID_API_KEY environment variable
  // Currently logs temporary passwords to server console for development
  
  console.log('\n' + '='.repeat(70));
  console.log('PASSWORD RECOVERY REQUEST');
  console.log('='.repeat(70));
  console.log(`To: ${email}`);
  console.log(`Temporary Password: ${password}`);
  console.log('Action: User must change password on next login');
  console.log('='.repeat(70) + '\n');
  
  // In production, uncomment and implement SendGrid:
  // try {
  //   const sgMail = require('@sendgrid/mail');
  //   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  //   
  //   await sgMail.send({
  //     to: email,
  //     from: process.env.SENDGRID_FROM_EMAIL || 'noreply@atlasreview.com',
  //     subject: 'Your Password Recovery for Atlas Review',
  //     html: `
  //       <p>Your temporary password for Atlas Review is: <strong>${password}</strong></p>
  //       <p>You will be required to change this password when you log in.</p>
  //     `
  //   });
  // } catch (error) {
  //   console.error('Failed to send email via SendGrid:', error);
  // }
}

export async function setupAuth(app: Express) {
  app.set('trust proxy', 1);
  app.use(getSession());

  // Forgot password route
  app.post('/api/auth/forgot-password', async (req, res) => {
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
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required to login.' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: 'Invalid email or password entered.' });
      }

      const isPasswordValid = await verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password entered.' });
      }

      // Create session
      (req as any).session.userId = user.id;
      (req as any).session.user = user;
      (req as any).user = user;

      // Save session before responding
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('Session Save Error:', err);
          return res.status(500).json({ message: 'Session Creation Failed' });
        }
        res.json({ success: true, user, passwordNeedsReset: user.passwordNeedsReset || false });
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
  app.post('/api/auth/register', async (req, res) => {
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

      // Create session
      (req as any).session.userId = newUser.id;
      (req as any).session.user = newUser;
      (req as any).user = newUser;

      // Save session before responding
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session creation failed' });
        }
        res.status(201).json({ success: true, user: newUser });
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
