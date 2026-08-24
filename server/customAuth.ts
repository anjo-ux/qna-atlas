import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import sgMail from '@sendgrid/mail';
import type { Express, Request, RequestHandler, Response } from 'express';
import connectPg from 'connect-pg-simple';
import { isAllowedTrainingLevel } from "@shared/trainingLevels";
import {
  DEFAULT_SPECIALTY_ID,
  getSpecialty,
  isSpecialtyId,
  type SpecialtyId,
} from "@shared/specialties";
import { storage } from './storage';
import {
  getCanonicalOriginForHost,
  getSpecialtyForHost,
  requestHostname,
  sessionCookieDomainForHost,
} from './seoPublic';
import { sanitizeUser } from './authUtils';
import { pool } from './db';

const SALT_ROUNDS = 12; // Strong password hashing
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Renamed from `connect.sid`: a previous deploy issued a `Domain=.prs-atlas.com`
 * cookie, so browsers now hold two cookies with that name. Express reads whichever
 * arrives first, which can be the stale one, leaving the user permanently logged out.
 */
const SESSION_COOKIE_NAME = 'atlas.sid';
const LEGACY_SESSION_COOKIE_NAME = 'connect.sid';
/** JS-readable marker so the SPA can hold a spinner instead of flashing the landing page. */
const AUTH_HINT_COOKIE_NAME = 'atlas.auth';

function requestCookieHeader(req: Request): string {
  return typeof req.headers.cookie === 'string' ? req.headers.cookie : '';
}

function requestHasCookie(req: Request, name: string): boolean {
  return requestCookieHeader(req)
    .split(';')
    .some((part) => part.trim().startsWith(`${name}=`));
}

/** Apex domain for the current specialty host, used only to delete legacy domain cookies. */
function legacyCookieDomain(req: Request): string | undefined {
  const domain = sessionCookieDomainForHost(requestHostname(req));
  return domain ?? undefined;
}

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
    name: SESSION_COOKIE_NAME,
    secret: getSessionSecret(),
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      // Follow X-Forwarded-Proto. Hardcoded secure:true drops the cookie when a
      // second custom domain (ortho-atlas.com) does not forward that header.
      secure: "auto",
      sameSite: "lax",
      maxAge: SESSION_TTL,
      path: "/",
      // Host-only on purpose: each specialty domain owns its own session.
    },
  });
}

/**
 * Identifies which content database this process is attached to, without exposing the
 * connection string. `fingerprint` is a hash of the host so environments can be compared.
 */
async function describeContentDatabase(): Promise<Record<string, unknown>> {
  let fingerprint = 'unknown';
  try {
    const dbHost = new URL(process.env.DATABASE_URL ?? '').hostname;
    fingerprint = createHash('sha256').update(dbHost).digest('hex').slice(0, 10);
  } catch {
    /* leave as unknown */
  }
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT count(*)::int FROM sections  WHERE id LIKE 'ortho-%') AS ortho_sections,
        (SELECT count(*)::int FROM questions WHERE id LIKE 'ortho-%') AS ortho_questions,
        (SELECT count(*)::int FROM sections  WHERE id NOT LIKE 'ortho-%') AS prs_sections
    `);
    return { fingerprint, ...rows[0] };
  } catch (error) {
    return { fingerprint, error: (error as Error).message.slice(0, 120) };
  }
}

/** Marks the browser as signed in so the SPA does not render Landing before auth resolves. */
function setAuthHintCookie(req: Request, res: Response): void {
  res.cookie(AUTH_HINT_COOKIE_NAME, '1', {
    httpOnly: false,
    secure: req.secure,
    sameSite: 'lax',
    maxAge: SESSION_TTL,
    path: '/',
  });
}

function clearAuthHintCookie(req: Request, res: Response): void {
  res.clearCookie(AUTH_HINT_COOKIE_NAME, { path: '/', sameSite: 'lax', secure: req.secure });
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

/** Shared limiter for public support intake (contact form). */
export const supportFormRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { message: "Too many messages. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

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

  app.use((req, res, next) => {
    // A leftover `connect.sid` (host-only or `Domain=.prs-atlas.com`) can arrive ahead of
    // the real session cookie, so delete both variants once the browser stops sending it.
    if (requestHasCookie(req, LEGACY_SESSION_COOKIE_NAME)) {
      const secure = req.secure;
      res.clearCookie(LEGACY_SESSION_COOKIE_NAME, { path: '/', sameSite: 'lax', secure });
      const domain = legacyCookieDomain(req);
      if (domain) {
        res.clearCookie(LEGACY_SESSION_COOKIE_NAME, { path: '/', sameSite: 'lax', secure, domain });
      }
    }

    const signedIn = Boolean((req as any).session?.userId);
    const hasHint = requestHasCookie(req, AUTH_HINT_COOKIE_NAME);
    if (signedIn && !hasHint) setAuthHintCookie(req, res);
    if (!signedIn && hasHint) clearAuthHintCookie(req, res);
    next();
  });

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
      if (typeof email !== 'string' || typeof password !== 'string') {
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

      try {
        await storage.setActiveSpecialty(user.id, getSpecialtyForHost(requestHostname(req)));
      } catch (specialtyErr) {
        console.error("Failed to pin active specialty on login:", specialtyErr);
      }

      if (user.passwordNeedsReset) {
        (req as any).session.userId = user.id;
        (req as any).session.user = sanitizeUser(user);
        (req as any).user = user;
        await new Promise<void>((resolve, reject) => {
          (req as any).session.save((err: any) => (err ? reject(err) : resolve()));
        });
        setAuthHintCookie(req, res);
        return res.json({ success: true, user: sanitizeUser(user), passwordNeedsReset: true });
      }

      const continueUrl = await mintSameOriginLoginContinue(req, user.id);
      return res.json({
        success: true,
        user: sanitizeUser(user),
        passwordNeedsReset: false,
        continueUrl,
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
      if (typeof email !== 'string' || email.trim().length > MAX_EMAIL) {
        return res.status(400).json({ message: 'Invalid email.' });
      }
      const normalizedEmail = email.trim().toLowerCase();
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
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: 'Invalid email format, please try again.' });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered, please login instead.' });
      }

      // Create user (no trial; they must go to subscription page to choose a plan or use institutional code)
      const passwordHash = await hashPassword(password);

      const newUser = await storage.upsertUser({
        email: normalizedEmail,
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

      const continueUrl = await mintSameOriginLoginContinue(req, newUser.id);
      return res.status(201).json({ success: true, user: sanitizeUser(newUser), continueUrl });
    } catch (error: any) {
      if (error?.code === '23505') {
        return res.status(409).json({ message: 'Email already registered, please login instead.' });
      }
      console.error('Register error:', error);
      res.status(500).json({ message: 'Registration failed.' });
    }
  });

  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const googleOAuthEnabled = Boolean(googleClientId && googleClientSecret);

  function authPublicOrigin(req: Request): string {
    const fromHost = getCanonicalOriginForHost(requestHostname(req));
    if (fromHost) return fromHost.replace(/\/$/, '');
    const proto =
      req.headers['x-forwarded-proto'] === 'https' || req.secure ? 'https' : 'http';
    return `${proto}://${requestHostname(req)}`;
  }

  function googleCallbackUrl(req: Request): string {
    return `${authPublicOrigin(req)}/api/auth/google/callback`;
  }

  function sameOriginSessionContinueUrl(plainToken: string): string {
    return `/api/auth/handoff/consume?token=${encodeURIComponent(plainToken)}`;
  }

/**
 * Password login/register used to Set-Cookie on the JSON POST. Switching q-banks
 * already worked because it sets the session on a top-level GET. On production,
 * Replit's proxy for the second custom domain (ortho-atlas.com) can drop Set-Cookie
 * on XHR/fetch responses, so the POST looks like a failed login. Finish the same
 * way as a handoff: mint a one-time token and navigate to consume it.
 */
  async function mintSameOriginLoginContinue(
    req: Request,
    userId: string,
    nextPath = '/',
  ): Promise<string> {
    const { plainToken } = await storage.createAuthHandoffToken({
      userId,
      targetSpecialtyId: getSpecialtyForHost(requestHostname(req)),
      nextPath,
    });
    return sameOriginSessionContinueUrl(plainToken);
  }

  function establishSession(
    req: Request,
    res: Response,
    user: Awaited<ReturnType<typeof storage.getUser>>,
  ) {
    if (!user) return;
    (req as any).session.userId = user.id;
    (req as any).session.user = sanitizeUser(user);
    (req as any).user = user;
    setAuthHintCookie(req, res);
  }

  app.get('/api/auth/google/status', (_req, res) => {
    res.json({ enabled: googleOAuthEnabled });
  });

  app.get('/api/auth/google', authRateLimiter, (req, res) => {
    if (!googleOAuthEnabled || !googleClientId) {
      return res.redirect('/login?oauth=unavailable');
    }

    const state = randomBytes(24).toString('hex');
    const requestedSpecialty = req.query.specialty;
    (req as any).session.googleOAuthState = state;
    (req as any).session.googleSignupSpecialty = isSpecialtyId(requestedSpecialty)
      ? requestedSpecialty
      : getSpecialtyForHost(requestHostname(req));

    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: googleCallbackUrl(req),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });

    (req as any).session.save((err: Error | null) => {
      if (err) {
        console.error('Google OAuth session save error:', err);
        return res.redirect('/login?oauth=error');
      }
      res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    });
  });

  app.get('/api/auth/google/callback', authRateLimiter, async (req, res) => {
    const fail = (reason: string) => res.redirect(`/login?oauth=${encodeURIComponent(reason)}`);

    try {
      if (!googleOAuthEnabled || !googleClientId || !googleClientSecret) {
        return fail('unavailable');
      }

      const queryError = typeof req.query.error === 'string' ? req.query.error : '';
      if (queryError) {
        return fail(queryError === 'access_denied' ? 'denied' : 'error');
      }

      const code = typeof req.query.code === 'string' ? req.query.code : '';
      const state = typeof req.query.state === 'string' ? req.query.state : '';
      const expectedState = (req as any).session?.googleOAuthState as string | undefined;
      delete (req as any).session.googleOAuthState;

      if (!code || !state || !expectedState || state !== expectedState) {
        return fail('invalid');
      }

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: googleCallbackUrl(req),
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        console.error('Google token exchange failed:', tokenRes.status);
        return fail('error');
      }

      const tokenJson = (await tokenRes.json()) as { access_token?: string };
      if (!tokenJson.access_token) {
        return fail('error');
      }

      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      });
      if (!profileRes.ok) {
        return fail('error');
      }

      const profile = (await profileRes.json()) as {
        email?: string;
        email_verified?: boolean | string;
        given_name?: string;
        family_name?: string;
        name?: string;
      };

      const email = profile.email?.trim().toLowerCase();
      const verified = profile.email_verified === true || profile.email_verified === 'true';
      if (!email || !verified) {
        return fail('unverified');
      }

      let user = await storage.getUserByEmail(email);
      const signupSpecialtyId: SpecialtyId = isSpecialtyId((req as any).session?.googleSignupSpecialty)
        ? (req as any).session.googleSignupSpecialty
        : getSpecialtyForHost(requestHostname(req));
      delete (req as any).session.googleSignupSpecialty;

      if (!user) {
        const nameParts = (profile.name || '').trim().split(/\s+/);
        const firstName = (profile.given_name || nameParts[0] || 'Student').slice(0, 100);
        const lastName = (profile.family_name || nameParts.slice(1).join(' ') || 'Google').slice(0, 100);

        user = await storage.upsertUser({
          email,
          firstName,
          lastName,
          subscriptionStatus: 'expired',
          trialEndsAt: null,
          signupSpecialtyId,
          activeSpecialtyId: signupSpecialtyId,
        });

        await storage.updateSpecialtyEntitlement(user.id, signupSpecialtyId, {
          subscriptionStatus: 'expired',
          trialEndsAt: null,
        });
      }

      try {
        await storage.addLoginConnection(user.id, 'google');
      } catch (connErr) {
        console.error('Failed to record Google login connection:', connErr);
      }

      try {
        await storage.setActiveSpecialty(user.id, getSpecialtyForHost(requestHostname(req)));
      } catch (specialtyErr) {
        console.error("Failed to pin active specialty on Google login:", specialtyErr);
      }

      establishSession(req, res, user);
      (req as any).session.save((err: Error | null) => {
        if (err) {
          console.error('Google OAuth session save error:', err);
          return fail('error');
        }
        res.redirect('/');
      });
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      return fail('error');
    }
  });

  /**
   * Cookie/host diagnostics for the two custom domains. Reports cookie *names* and
   * booleans only — never session contents or user data.
   */
  app.get('/api/auth/session-debug', async (req, res) => {
    const cookieNames = requestCookieHeader(req)
      .split(';')
      .map((part) => part.trim().split('=')[0])
      .filter(Boolean);
    const host = requestHostname(req);
    res.json({
      database: await describeContentDatabase(),
      host,
      hostHeader: req.headers.host ?? null,
      forwardedHost: req.headers['x-forwarded-host'] ?? null,
      origin: req.headers.origin ?? null,
      referer: req.headers.referer ?? null,
      forwardedProto: req.headers['x-forwarded-proto'] ?? null,
      reqSecure: req.secure,
      specialty: getSpecialtyForHost(host),
      cookieNames,
      hasSessionCookie: cookieNames.includes(SESSION_COOKIE_NAME),
      hasLegacyCookie: cookieNames.includes(LEGACY_SESSION_COOKIE_NAME),
      signedIn: Boolean((req as any).session?.userId),
    });
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed.' });
      }
      res.clearCookie(SESSION_COOKIE_NAME, { path: '/', sameSite: 'lax', secure: req.secure });
      res.clearCookie(LEGACY_SESSION_COOKIE_NAME, { path: '/', sameSite: 'lax', secure: req.secure });
      clearAuthHintCookie(req, res);
      res.json({ success: true });
    });
  });

  /**
   * Mint a one-time URL that recreates this session on another specialty's domain.
   * Used when switching q-banks (prs ↔ ortho) and when Ortho Stripe checkout starts on PRS.
   */
  app.post('/api/auth/handoff', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).session?.userId as string;
      const targetSpecialtyId = req.body?.targetSpecialtyId;
      if (!isSpecialtyId(targetSpecialtyId)) {
        return res.status(400).json({ message: 'targetSpecialtyId must be prs or ortho.' });
      }
      const nextPath =
        typeof req.body?.nextPath === 'string' ? req.body.nextPath : '/';
      const continueExternalUrl =
        typeof req.body?.continueExternalUrl === 'string' ? req.body.continueExternalUrl : null;

      const target = getSpecialty(targetSpecialtyId);
      const { plainToken } = await storage.createAuthHandoffToken({
        userId,
        targetSpecialtyId,
        nextPath,
        continueExternalUrl,
      });

      // Ensure active specialty matches the destination before they land.
      await storage.setActiveSpecialty(userId, targetSpecialtyId);

      const handoffUrl = `${target.canonicalOrigin}/api/auth/handoff/consume?token=${encodeURIComponent(plainToken)}`;
      res.json({
        handoffUrl,
        targetSpecialtyId: target.id,
        targetOrigin: target.canonicalOrigin,
      });
    } catch (error) {
      console.error('Handoff mint error:', error);
      res.status(500).json({ message: 'Failed to create cross-domain handoff.' });
    }
  });

  /**
   * Consume a handoff token on the destination host: establish session cookie, then redirect.
   */
  app.get('/api/auth/handoff/consume', async (req, res) => {
    try {
      const token = typeof req.query.token === 'string' ? req.query.token : '';
      const consumed = await storage.consumeAuthHandoffToken(token);
      if (!consumed) {
        return res.redirect(302, '/login?handoff=expired');
      }

      const hostSpecialty = getSpecialtyForHost(requestHostname(req));
      // Prefer landing on the specialty this token was minted for; fall back to host if mismatched in staging.
      if (hostSpecialty !== consumed.targetSpecialtyId && process.env.NODE_ENV === 'production') {
        console.warn('[handoff] host specialty mismatch', {
          host: requestHostname(req),
          hostSpecialty,
          target: consumed.targetSpecialtyId,
        });
      }

      const user = await storage.getUser(consumed.userId);
      if (!user) {
        return res.redirect(302, '/login?handoff=invalid');
      }

      await storage.setActiveSpecialty(consumed.userId, consumed.targetSpecialtyId);

      await new Promise<void>((resolve, reject) => {
        (req as any).session.regenerate((err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          // regenerate() swaps in a brand-new session under a new id, so the identity
          // must be written to req.session here — a reference captured earlier points
          // at the destroyed session and would leave the new cookie signed in to nothing.
          const fresh = (req as any).session;
          fresh.userId = user.id;
          fresh.user = sanitizeUser(user);
          fresh.save((saveErr: Error | null) => (saveErr ? reject(saveErr) : resolve()));
        });
      });

      setAuthHintCookie(req, res);

      if (consumed.continueExternalUrl) {
        return res.redirect(302, consumed.continueExternalUrl);
      }

      const next = consumed.nextPath.startsWith('/') ? consumed.nextPath : '/';
      return res.redirect(302, next);
    } catch (error) {
      console.error('Handoff consume error:', error);
      return res.redirect(302, '/login?handoff=error');
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const session = (req as any).session;

  if (!session?.userId) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  // Verify user still exists
  const currentUser = await storage.getUser(session.userId || session.userId);
  if (!currentUser) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  // Attach user to request for use in route handlers
  (req as any).user = currentUser;

  next();
};
