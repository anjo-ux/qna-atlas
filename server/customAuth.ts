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

export async function setupAuth(app: Express) {
  app.set('trust proxy', 1);
  app.use(getSession());

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Create session
      (req as any).session.userId = user.id;
      (req as any).session.user = user;
      (req as any).user = user;

      // Save session before responding
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session creation failed' });
        }
        res.json({ success: true, user });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, confirmPassword, institutionalAffiliation } = req.body;

      // Validation
      if (!email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields required' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: 'Password must be at least 8 characters' });
      }

      // Check email validity
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Create user
      const passwordHash = await hashPassword(password);
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);

      const newUser = await storage.upsertUser({
        email,
        passwordHash,
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
