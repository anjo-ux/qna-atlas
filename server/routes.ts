import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./customAuth";
import { sanitizeUser } from "./authUtils";
import { createTesterRedirectToken, verifyTesterRedirectToken, ATLAS_TRAINER_CALLBACK_URL } from "./testerToken";
import { insertTestSessionSchema, updateTestSessionSchema, insertQuestionResponseSchema, insertQuestionSchema } from "@shared/schemas";
import { validateQuestionFormat, contentRulesForGenerated } from "@shared/questionFormat";
import { subsectionOrder, subsectionTitles } from "@shared/questionImport";
import type { User, SubscriptionTransaction } from "@shared/schema";

const ADMIN_CODE = process.env.ADMIN_CODE || "1127";

/** Paid personal plans (Stripe / checkout); institutional is excluded. */
const PAID_SUBSCRIPTION_PLAN_NAMES = new Set([
  "monthly",
  "6-month",
  "1-year",
  "1-month",
  "3-month",
]);

/**
 * True when the user should be treated as on a personal paid/trial subscription path.
 * Takes precedence over institutional access for API + UI so a paid sub overrides an old institutional grant.
 */
function userHasPersonalSubscriptionAccess(
  user: User | undefined,
  activeTx?: SubscriptionTransaction | undefined
): boolean {
  if (!user) return false;
  const now = Date.now();
  if (user.stripeSubscriptionId?.trim()) return true;

  const plan = user.subscriptionPlan ?? undefined;
  const hasNamedPaidPlan = plan ? PAID_SUBSCRIPTION_PLAN_NAMES.has(plan) : false;
  const txEndOk = !!(activeTx && new Date(activeTx.endDate).getTime() > now);

  if (!hasNamedPaidPlan) {
    return txEndOk;
  }

  const st = user.subscriptionStatus || "trial";
  if (st === "active") return true;
  if (st === "trial" && user.trialEndsAt && new Date(user.trialEndsAt).getTime() > now) return true;
  if (st === "canceled" && user.subscriptionEndsAt && new Date(user.subscriptionEndsAt).getTime() > now)
    return true;
  return txEndOk;
}
const QUESTION_IMPORT_API_KEY = process.env.QUESTION_IMPORT_API_KEY;

function requireAdminCode(req: any): boolean {
  const code = req.headers["x-admin-code"];
  return code === ADMIN_CODE;
}

/** Require QUESTION_IMPORT_API_KEY via Authorization: Bearer <key> or X-API-Key header. */
function requireImportApiKey(req: any): boolean {
  if (!QUESTION_IMPORT_API_KEY) return false;
  const auth = req.headers.authorization;
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const headerKey = req.headers["x-api-key"];
  return bearer === QUESTION_IMPORT_API_KEY || headerKey === QUESTION_IMPORT_API_KEY;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication middleware
  await setupAuth(app);

  // One-time reset all users to no subscription when RUN_SUBSCRIPTION_RESET=true (unset after running)
  try {
    await storage.runSubscriptionResetIfRequested();
  } catch (err) {
    console.error("Subscription reset (RUN_SUBSCRIPTION_RESET) failed; server continuing:", err);
  }

  // Hidden by default: set ENABLE_ADMIN_GENERATED_QUESTIONS_UI=true to expose. Admin: list generated draft questions (requires admin code; no auth)
  if (process.env.ENABLE_ADMIN_GENERATED_QUESTIONS_UI === "true") {
    app.get("/api/admin/generated-questions", async (req: any, res) => {
      if (!requireAdminCode(req)) {
        return res.status(403).json({ message: "Invalid admin code." });
      }
      try {
        const drafts = await storage.getDraftGeneratedQuestions();
        res.json(drafts);
      } catch (error) {
        console.error("Error fetching draft questions:", error);
        res.status(500).json({ message: "Failed to fetch draft questions." });
      }
    });
    app.post("/api/admin/generate-questions", async (req: any, res) => {
      if (!requireAdminCode(req)) {
        return res.status(403).json({ message: "Invalid admin code." });
      }
      try {
        const { runQuestionGenerationJob } = await import("./jobs/questionGenerationJob");
        const result = await runQuestionGenerationJob();
        res.json(result);
      } catch (error) {
        console.error("Error running question generation:", error);
        res.status(500).json({
          message: "Question generation failed.",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  // Admin: set user tester status (beta access to Atlas Trainer). Requires X-Admin-Code.
  app.patch("/api/admin/users/:userId/tester", async (req: any, res) => {
    if (!requireAdminCode(req)) {
      return res.status(403).json({ message: "Invalid admin code." });
    }
    const { userId } = req.params;
    const tester = req.body?.tester;
    if (typeof tester !== "boolean") {
      return res.status(400).json({ message: "Body must include { tester: true | false }." });
    }
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      const updated = await storage.updateUserTester(userId, tester);
      res.json(sanitizeUser(updated));
    } catch (error) {
      console.error("Error updating user tester status:", error);
      res.status(500).json({ message: "Failed to update tester status." });
    }
  });

  // External: list valid subsection IDs (for import UI). Requires QUESTION_IMPORT_API_KEY.
  app.get("/api/admin/subsection-ids", async (req: any, res) => {
    if (!requireImportApiKey(req)) {
      return res.status(403).json({
        message: "Invalid or missing API key. Set Authorization: Bearer <QUESTION_IMPORT_API_KEY> or X-API-Key header.",
      });
    }
    const subsections = subsectionOrder.map((id) => ({
      id,
      title: subsectionTitles[id] ?? id,
    }));
    res.json({
      subsectionIds: subsectionOrder,
      subsections,
      data: { ids: subsectionOrder },
    });
  });

  // External: import an approved question from another app (e.g. external question generator). Requires QUESTION_IMPORT_API_KEY.
  app.post("/api/admin/import-question", async (req: any, res) => {
    if (!requireImportApiKey(req)) {
      return res.status(403).json({
        message: "Invalid or missing API key. Set Authorization: Bearer <QUESTION_IMPORT_API_KEY> or X-API-Key header.",
      });
    }
    try {
      const validationResult = insertQuestionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data.",
          errors: validationResult.error.flatten().fieldErrors,
        });
      }
      const data = validationResult.data;
      const visible = typeof req.body.visible === "boolean" ? req.body.visible : undefined;
      if (data.source === "generated") {
        const formatResult = validateQuestionFormat(data.question, data.answer);
        if (!formatResult.valid) {
          return res.status(400).json({
            message: "Generated question failed format validation.",
            errors: formatResult.errors,
          });
        }
        const contentResult = contentRulesForGenerated(data.question);
        if (!contentResult.pass) {
          return res.status(400).json({
            message: contentResult.reason ?? "Generated question failed content rules.",
          });
        }
      }
      const { id } = await storage.createQuestion({ ...data, visible });
      res.status(201).json({ id });
    } catch (error) {
      console.error("Error importing question:", error);
      res.status(500).json({ message: "Failed to import question." });
    }
  });

  // Questions API (sections with nested subsections and questions)
  // Public so unauthenticated users can load the preview test at /preview
  app.get('/api/sections', async (req: any, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ message: "Failed to fetch sections." });
    }
  });

  // Create AI-generated question (authenticated; same path used by scheduled job)
  app.post('/api/questions', isAuthenticated, async (req: any, res) => {
    try {
      const validationResult = insertQuestionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data.",
          errors: validationResult.error.flatten().fieldErrors,
        });
      }
      const data = validationResult.data;
      if (data.source === "generated") {
        const formatResult = validateQuestionFormat(data.question, data.answer);
        if (!formatResult.valid) {
          return res.status(400).json({
            message: "Generated question failed format validation.",
            errors: formatResult.errors,
          });
        }
        const contentResult = contentRulesForGenerated(data.question);
        if (!contentResult.pass) {
          return res.status(400).json({
            message: contentResult.reason ?? "Generated question failed content rules.",
          });
        }
      }
      const { id } = await storage.createQuestion(data);
      res.status(201).json({ id });
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question." });
    }
  });

  // Update question visibility (push generated question live; requires auth OR valid admin code)
  app.patch('/api/questions/:id', async (req: any, res) => {
    const hasAuth = req.session?.userId;
    const hasCode = requireAdminCode(req);
    if (!hasAuth && !hasCode) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    try {
      const { id } = req.params;
      const { visible } = req.body;
      if (typeof visible !== "boolean") {
        return res.status(400).json({ message: "Body must include visible: boolean." });
      }
      const question = await storage.getQuestion(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found." });
      }
      const updated = await storage.updateQuestionVisibility(id, visible);
      if (!updated) {
        return res.status(500).json({ message: "Failed to update question." });
      }
      res.json({ id, visible });
    } catch (error) {
      console.error("Error updating question visibility:", error);
      res.status(500).json({ message: "Failed to update question." });
    }
  });

  // Report question (sends email to support; works with or without auth)
  app.post('/api/report-question', async (req: any, res) => {
    try {
      const { questionId, message } = req.body ?? {};
      if (typeof questionId !== 'string' || !questionId.trim()) {
        return res.status(400).json({ message: 'Missing or invalid question ID.' });
      }
      if (typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ message: 'Please describe what is wrong with the question.' });
      }
      const MAX_MESSAGE = 2000;
      const trimmedMessage = message.trim().slice(0, MAX_MESSAGE);
      const trimmedQuestionId = questionId.trim();
      let userEmail: string | null = null;
      const userId = req.session?.userId ?? null;
      if (userId) {
        const user = await storage.getUser(userId);
        userEmail = user?.email ?? null;
      }
      await storage.createQuestionReport({
        questionId: trimmedQuestionId,
        message: trimmedMessage,
        userEmail: userEmail ?? undefined,
        userId: userId ?? undefined,
      });
      // Email disabled for now; reports are stored in DB only. Run npm run summarize:reports to view.
      res.json({ message: 'Report sent.' });
    } catch (error) {
      console.error('Error sending question report:', error);
      res.status(500).json({ message: 'Failed to send report. Please try again later.' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Allow unauthenticated access - return null if not logged in
      const userId = req.session?.userId;
      if (!userId) {
        return res.json(null);
      }
      
      const user = await storage.getUser(userId);
      res.json(sanitizeUser(user) ?? null);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user." });
    }
  });

  // Update user profile (allowlist only — never accept passwordHash or other sensitive fields from body)
  const PROFILE_STRING_MAX = 255;
  const NAME_MAX = 100;
  const AVATAR_MAX = 50;
  app.patch('/api/auth/user', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized." });
      }
      const body = req.body ?? {};
      const updates: Record<string, string | undefined> = {};
      if (body.username !== undefined) {
        const v = typeof body.username === 'string' ? body.username.slice(0, PROFILE_STRING_MAX) : undefined;
        updates.username = v === '' ? undefined : v;
      }
      if (body.firstName !== undefined) {
        const v = typeof body.firstName === 'string' ? body.firstName.slice(0, NAME_MAX) : undefined;
        updates.firstName = v;
      }
      if (body.lastName !== undefined) {
        const v = typeof body.lastName === 'string' ? body.lastName.slice(0, NAME_MAX) : undefined;
        updates.lastName = v;
      }
      if (body.institutionalAffiliation !== undefined) {
        const v = typeof body.institutionalAffiliation === 'string' ? body.institutionalAffiliation.slice(0, PROFILE_STRING_MAX) : undefined;
        updates.institutionalAffiliation = v;
      }
      if (body.avatarIcon !== undefined) {
        const v = typeof body.avatarIcon === 'string' ? body.avatarIcon.slice(0, AVATAR_MAX) : undefined;
        updates.avatarIcon = v;
      }
      const updatedUser = await storage.updateUserProfile(userId, updates);
      res.json(sanitizeUser(updatedUser));
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user." });
    }
  });

  // Tester redirect: create short-lived token and redirect to Atlas Trainer (train.prs-atlas.com)
  app.get("/api/auth/tester-redirect", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        console.warn("[tester-redirect] 401: No session userId");
        return res.status(401).json({ message: "Unauthorized." });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        console.warn("[tester-redirect] 401: User not found", { userId });
        return res.status(401).json({ message: "User not found." });
      }
      if (user.tester !== true) {
        console.warn("[tester-redirect] 403: User is not a tester", { userId });
        return res.status(403).json({ message: "Beta testing access required." });
      }
      const token = createTesterRedirectToken(userId);
      const url = `${ATLAS_TRAINER_CALLBACK_URL}?token=${encodeURIComponent(token)}`;
      console.warn("[tester-redirect] 302 redirect to train with token", {
        urlPrefix: ATLAS_TRAINER_CALLBACK_URL,
        tokenLength: token.length,
        hasTokenInUrl: url.includes("token="),
      });
      res.redirect(302, url);
    } catch (error) {
      console.error("Error creating tester redirect:", error);
      res.status(500).json({ message: "Failed to create redirect." });
    }
  });

  // Verify tester token (called by train.prs-atlas.com). Returns user if token is valid and user is a tester.
  // Supports GET ?token=... and POST body { token } so train can avoid query-length/encoding issues.
  const TESTER_VERIFY_SECRET = process.env.TESTER_VERIFY_SECRET;
  const ATLAS_TRAINER_ORIGIN = "https://train.prs-atlas.com";

  const handleVerifyTesterToken = async (req: any, res: any) => {
    console.warn("[verify-tester-token] request received", {
      method: req.method,
      hasQueryToken: !!req.query?.token,
      hasBodyToken: !!(req.body?.token),
    });
    const token =
      (req.query.token as string | undefined) ||
      (req.body?.token as string | undefined);
    const tokenStr = typeof token === "string" ? token.trim() : undefined;

    if (TESTER_VERIFY_SECRET) {
      const secret = req.headers["x-tester-verify-secret"] ?? req.headers.authorization?.replace(/^Bearer\s+/i, "");
      if (secret !== TESTER_VERIFY_SECRET) {
        console.warn("[verify-tester-token] 403: Invalid or missing verification secret");
        return res.status(403).json({ message: "Invalid or missing verification secret." });
      }
    }
    if (!tokenStr) {
      console.warn("[verify-tester-token] 400: Missing token");
      return res.status(400).json({ message: "Missing token." });
    }
    const payload = verifyTesterRedirectToken(tokenStr);
    if (!payload) {
      console.warn("[verify-tester-token] 401: Invalid or expired token");
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    const user = await storage.getUser(payload.userId);
    if (!user || user.tester !== true) {
      console.warn("[verify-tester-token] 403: User not found or not a tester", { userId: payload.userId });
      return res.status(403).json({ message: "User is not a tester." });
    }
    res.json({ valid: true, user: sanitizeUser(user) });
  };

  app.get("/api/auth/verify-tester-token", (req, res, next) => {
    res.set("Access-Control-Allow-Origin", ATLAS_TRAINER_ORIGIN);
    return handleVerifyTesterToken(req, res).catch(next);
  });
  app.post("/api/auth/verify-tester-token", (req, res, next) => {
    res.set("Access-Control-Allow-Origin", ATLAS_TRAINER_ORIGIN);
    return handleVerifyTesterToken(req, res).catch(next);
  });
  app.options("/api/auth/verify-tester-token", (_req, res) => {
    res.set("Access-Control-Allow-Origin", ATLAS_TRAINER_ORIGIN);
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tester-Verify-Secret");
    res.set("Access-Control-Max-Age", "86400");
    res.sendStatus(204);
  });

  // Get user percentile rank
  app.get('/api/user/percentile', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized." });
      }

      const percentile = await storage.getUserPercentileRank(userId);
      res.json({ percentile });
    } catch (error) {
      console.error("Error calculating percentile:", error);
      res.status(500).json({ message: "Failed to calculate percentile." });
    }
  });

  // Check subscription status
  app.get('/api/subscription', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.json({ status: 'none', daysRemaining: 0, trialEndsAt: null, isLocked: false });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.json({ status: 'none', daysRemaining: 0, trialEndsAt: null, isLocked: false });
      }

      // Access-granting institution only (set by code redemption; independent of profile affiliation)
      const hasInstitutionalAffiliation = !!user.institutionalAccessAffiliation?.trim();
      const institutionalExpiresAt = user.institutionalAccessExpiresAt ? new Date(user.institutionalAccessExpiresAt) : null;
      const institutionalExpired = institutionalExpiresAt !== null && institutionalExpiresAt <= new Date();
      if (institutionalExpired && hasInstitutionalAffiliation) {
        await storage.updateUserProfile(userId, {
          institutionalAccessAffiliation: null as any,
          institutionalAccessExpiresAt: null as any,
        });
      }
      const hasInstitutionalAccess = hasInstitutionalAffiliation && !institutionalExpired;
      const activeTxEarly = await storage.getUserActiveSubscription(userId);
      if (hasInstitutionalAccess && !userHasPersonalSubscriptionAccess(user, activeTxEarly)) {
        const daysRemaining = institutionalExpiresAt
          ? Math.max(0, Math.ceil((institutionalExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : -1;
        return res.json({
          status: 'institutional',
          daysRemaining,
          trialEndsAt: null,
          isLocked: false,
          subscriptionType: 'Institutional Affiliation',
        });
      }

      const now = new Date();
      const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
      const subscriptionEndsAt = user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null;

      let status = user.subscriptionStatus || 'trial';
      let daysRemaining = 0;

      if (status === 'canceled' && subscriptionEndsAt && subscriptionEndsAt > now) {
        daysRemaining = Math.max(0, Math.ceil((subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      } else if (trialEndsAt) {
        const diffTime = trialEndsAt.getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        if (daysRemaining === 0 && status === 'trial') {
          status = 'expired';
          await storage.updateUserProfile(user.id, { subscriptionStatus: 'expired' });
        }
      }

      // Lock when expired or when on trial with no days left (e.g. new account with no plan). Canceled = access until end.
      // Expiry/cancel only update subscription status; user data (progress, notes, bookmarks) is never deleted.
      const isLocked =
        status === 'expired' ||
        (status === 'trial' && daysRemaining === 0) ||
        (status === 'canceled' && (!subscriptionEndsAt || subscriptionEndsAt <= now));

      res.json({
        status,
        daysRemaining,
        trialEndsAt,
        isLocked,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.json({ status: 'error', daysRemaining: 0, trialEndsAt: null, isLocked: false });
    }
  });

  // Get user's login connections
  app.get('/api/auth/connections', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.json([]);
      }
      const connections = await storage.getLoginConnections(userId);
      res.json(connections.map(c => c.provider));
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections." });
    }
  });

  // Get user's theme preference
  app.get('/api/theme', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.json({ theme: 'light' });
      }
      const theme = await storage.getThemePreference(userId);
      res.json({ theme });
    } catch (error) {
      console.error("Error fetching theme preference:", error);
      res.json({ theme: 'light' });
    }
  });

  // Update user's theme preference
  app.post('/api/theme', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized." });
      }
      const { theme } = req.body;
      
      if (!theme || (theme !== 'light' && theme !== 'dark')) {
        return res.status(400).json({ message: "Invalid theme." });
      }
      
      const updatedTheme = await storage.updateThemePreference(userId, theme);
      res.json({ theme: updatedTheme });
    } catch (error) {
      console.error("Error updating theme preference:", error);
      res.status(500).json({ message: "Failed to update theme preference." });
    }
  });

  // Add login connection
  app.post('/api/auth/connections/:provider', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized." });
      }
      const { provider } = req.params;
      
      await storage.addLoginConnection(userId, provider);
      res.json({ provider, added: true });
    } catch (error) {
      console.error("Error adding connection:", error);
      res.status(500).json({ message: "Failed to add connection." });
    }
  });

  // Remove login connection
  app.delete('/api/auth/connections/:provider', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized." });
      }
      const { provider } = req.params;
      
      const connections = await storage.getLoginConnections(userId);
      if (connections.length <= 1) {
        return res.status(400).json({ message: "Cannot remove last connection." });
      }
      
      await storage.removeLoginConnection(userId, provider);
      res.json({ provider, removed: true });
    } catch (error) {
      console.error("Error removing connection:", error);
      res.status(500).json({ message: "Failed to remove connection." });
    }
  });

  // Test Session routes (all protected)
  app.get('/api/test-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const sessions = await storage.getUserTestSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching test sessions:", error);
      res.status(500).json({ message: "Failed to fetch test sessions." });
    }
  });

  app.get('/api/test-sessions/in-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const sessions = await storage.getInProgressSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching in-progress sessions:", error);
      res.status(500).json({ message: "Failed to fetch in-progress sessions." });
    }
  });

  app.get('/api/test-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const session = await storage.getTestSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: "Test session not found." });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden." });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching test session:", error);
      res.status(500).json({ message: "Failed to fetch test session." });
    }
  });

  app.post('/api/test-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      
      // Validate request body
      const validationResult = insertTestSessionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data.",
          errors: validationResult.error.flatten().fieldErrors
        });
      }
      
      const sessionData = {
        ...validationResult.data,
        userId,
      };
      
      const session = await storage.createTestSession(sessionData as any);
      res.json(session);
    } catch (error) {
      console.error("Error creating test session:", error);
      res.status(500).json({ message: "Failed to create test session." });
    }
  });

  app.patch('/api/test-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const session = await storage.getTestSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: "Test session not found." });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden." });
      }
      
      // Validate and whitelist allowed fields
      const validationResult = updateTestSessionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data.",
          errors: validationResult.error.errors 
        });
      }
      
      const updated = await storage.updateTestSession(req.params.id, validationResult.data);
      res.json(updated);
    } catch (error) {
      console.error("Error updating test session:", error);
      res.status(500).json({ message: "Failed to update test session." });
    }
  });

  app.post('/api/test-sessions/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const session = await storage.getTestSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: "Test session not found." });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden." });
      }
      
      const completed = await storage.completeTestSession(req.params.id);
      res.json(completed);
    } catch (error) {
      console.error("Error completing test session:", error);
      res.status(500).json({ message: "Failed to complete test session." });
    }
  });

  app.delete('/api/test-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const session = await storage.getTestSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: "Test session not found." });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden." });
      }
      
      await storage.deleteTestSession(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting test session:", error);
      res.status(500).json({ message: "Failed to delete test session." });
    }
  });

  // Question Response routes (all protected)
  app.post('/api/question-responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      
      // Validate request body
      const validationResult = insertQuestionResponseSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data.",
          errors: validationResult.error.flatten().fieldErrors
        });
      }
      
      const { testSessionId } = validationResult.data;
      
      // Verify the test session belongs to the user (if testSessionId provided)
      if (testSessionId) {
        const session = await storage.getTestSession(testSessionId);
        if (!session || session.userId !== userId) {
          return res.status(403).json({ message: "Forbidden." });
        }
      }
      
      // Add userId to the response data before saving
      const responseData = {
        ...validationResult.data,
        userId
      };
      
      const response = await storage.upsertQuestionResponse(responseData);
      res.json(response);
    } catch (error) {
      console.error("Error saving question response:", error);
      res.status(500).json({ message: "Failed to save question response." });
    }
  });

  app.get('/api/test-sessions/:id/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const session = await storage.getTestSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: "Test session not found." });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden." });
      }
      
      const responses = await storage.getTestSessionResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ message: "Failed to fetch responses." });
    }
  });

  // Notes endpoints
  app.get('/api/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { sectionId, subsectionId } = req.query;
      const userNotes = await storage.getUserNotes(userId, sectionId as string, subsectionId as string);
      res.json(userNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes." });
    }
  });

  app.post('/api/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { content, sectionId, subsectionId, location, questionId, positionX, positionY } = req.body;
      
      const note = await storage.createNote({
        userId,
        content,
        sectionId,
        subsectionId,
        location,
        questionId,
        positionX: positionX || 100,
        positionY: positionY || 100,
      });
      
      res.json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Failed to create note." });
    }
  });

  app.patch('/api/notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const noteId = req.params.id;
      const { content, positionX, positionY } = req.body;
      
      // Verify note belongs to user - need to get the note first
      const userNotes = await storage.getUserNotes(userId);
      const note = userNotes.find(n => n.id === noteId);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found." });
      }
      
      const updates: any = {};
      if (content !== undefined) updates.content = content;
      if (positionX !== undefined) updates.positionX = positionX;
      if (positionY !== undefined) updates.positionY = positionY;
      
      const updatedNote = await storage.updateNote(noteId, updates);
      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ message: "Failed to update note." });
    }
  });

  app.delete('/api/notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const noteId = req.params.id;
      
      // Verify note belongs to user
      const userNotes = await storage.getUserNotes(userId);
      const note = userNotes.find(n => n.id === noteId);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found." });
      }
      
      await storage.deleteNote(noteId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note." });
    }
  });

  // Bookmarks routes
  app.get('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const bookmarks = await storage.getUserBookmarks(userId);
      // Disable caching for bookmarks to ensure fresh data is always returned
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks." });
    }
  });

  app.post('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { questionId, sectionId, subsectionId } = req.body;
      
      if (!questionId || !sectionId || !subsectionId) {
        return res.status(400).json({ message: "Missing required fields." });
      }
      
      const bookmark = await storage.addBookmark({
        userId,
        questionId,
        sectionId,
        subsectionId,
      });
      
      res.json(bookmark);
    } catch (error) {
      console.error("Error adding bookmark:", error);
      res.status(500).json({ message: "Failed to add bookmark." });
    }
  });

  app.delete('/api/bookmarks/:questionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const questionId = req.params.questionId;
      
      await storage.removeBookmark(userId, questionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ message: "Failed to remove bookmark." });
    }
  });

  app.get('/api/bookmarks/check/:questionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const questionId = req.params.questionId;
      
      const isBookmarked = await storage.isQuestionBookmarked(userId, questionId);
      res.json({ isBookmarked });
    } catch (error) {
      console.error("Error checking bookmark:", error);
      res.status(500).json({ message: "Failed to check bookmark." });
    }
  });

  // Highlights routes
  app.get('/api/highlights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const highlights = await storage.getUserHighlights(userId);
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      res.status(500).json({ message: "Failed to fetch highlights." });
    }
  });

  app.post('/api/highlights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { text, color, sectionId, subsectionId, location, questionId, startOffset, endOffset } = req.body;
      
      if (!text || !sectionId || !subsectionId || !location || startOffset === undefined || endOffset === undefined) {
        return res.status(400).json({ message: "Missing required fields." });
      }
      
      const highlight = await storage.createHighlight({
        userId,
        text,
        color: color || 'yellow',
        sectionId,
        subsectionId,
        location,
        questionId: questionId || null,
        startOffset,
        endOffset,
      });
      
      res.json(highlight);
    } catch (error) {
      console.error("Error creating highlight:", error);
      res.status(500).json({ message: "Failed to create highlight." });
    }
  });

  app.patch('/api/highlights/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const highlightId = req.params.id;
      const updates = req.body;
      
      // Verify highlight belongs to user
      const userHighlights = await storage.getUserHighlights(userId);
      const highlight = userHighlights.find(h => h.id === highlightId);
      
      if (!highlight) {
        return res.status(404).json({ message: "Highlight not found." });
      }
      
      const updatedHighlight = await storage.updateHighlight(highlightId, updates);
      res.json(updatedHighlight);
    } catch (error) {
      console.error("Error updating highlight:", error);
      res.status(500).json({ message: "Failed to update highlight." });
    }
  });

  app.delete('/api/highlights/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const highlightId = req.params.id;
      
      // Verify highlight belongs to user
      const userHighlights = await storage.getUserHighlights(userId);
      const highlight = userHighlights.find(h => h.id === highlightId);
      
      if (!highlight) {
        return res.status(404).json({ message: "Highlight not found." });
      }
      
      await storage.deleteHighlight(highlightId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting highlight:", error);
      res.status(500).json({ message: "Failed to delete highlight." });
    }
  });

  // Bulk sync highlights (for reconciling local and server data)
  app.post('/api/highlights/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { highlights: localHighlights } = req.body;
      
      if (!Array.isArray(localHighlights)) {
        return res.status(400).json({ message: "Invalid highlights data." });
      }
      
      // Get server highlights
      const serverHighlights = await storage.getUserHighlights(userId);
      
      // Create new highlights that exist locally but not on server
      const createdHighlights = [];
      for (const local of localHighlights) {
        // Check if highlight already exists (by matching offsets and location)
        const exists = serverHighlights.some(s => 
          s.sectionId === local.sectionId &&
          s.subsectionId === local.subsectionId &&
          s.location === local.location &&
          s.startOffset === local.startOffset &&
          s.endOffset === local.endOffset
        );
        
        if (!exists) {
          const created = await storage.createHighlight({
            userId,
            text: local.text,
            color: local.color || 'yellow',
            sectionId: local.sectionId,
            subsectionId: local.subsectionId,
            location: local.location,
            questionId: local.questionId || null,
            startOffset: local.startOffset,
            endOffset: local.endOffset,
          });
          createdHighlights.push(created);
        }
      }
      
      // Return all highlights (merged)
      const allHighlights = await storage.getUserHighlights(userId);
      res.json(allHighlights);
    } catch (error) {
      console.error("Error syncing highlights:", error);
      res.status(500).json({ message: "Failed to sync highlights." });
    }
  });

  // Question Responses routes (study mode - without test session)
  app.get('/api/question-responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const responses = await storage.getUserQuestionResponses(userId);
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json(responses);
    } catch (error) {
      console.error("Error fetching question responses:", error);
      res.status(500).json({ message: "Failed to fetch question responses." });
    }
  });

  app.put('/api/question-responses/:questionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const questionId = req.params.questionId;
      const { sectionId, subsectionId, selectedAnswer, correctAnswer, isCorrect } = req.body;
      
      if (!sectionId || !subsectionId || !selectedAnswer || isCorrect === undefined) {
        return res.status(400).json({ message: "Missing required fields." });
      }
      
      const response = await storage.upsertStudyModeResponse(userId, {
        questionId,
        sectionId,
        subsectionId,
        selectedAnswer,
        correctAnswer: correctAnswer || '',
        isCorrect,
      });
      
      res.json(response);
    } catch (error) {
      console.error("Error saving question response:", error);
      res.status(500).json({ message: "Failed to save question response." });
    }
  });

  // Delete all question responses for user
  app.delete('/api/question-responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      await storage.deleteAllStudyModeResponses(userId);
      res.json({ message: "All responses deleted." });
    } catch (error) {
      console.error("Error deleting all question responses:", error);
      res.status(500).json({ message: "Failed to delete question responses." });
    }
  });

  // Bulk sync question responses (for reconciling local and server data)
  app.post('/api/question-responses/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { responses: localResponses } = req.body;
      
      if (!Array.isArray(localResponses)) {
        return res.status(400).json({ message: "Invalid responses data." });
      }
      
      // Process each local response
      for (const local of localResponses) {
        if (local.questionId && local.sectionId && local.subsectionId && local.selectedAnswer !== undefined) {
          await storage.upsertStudyModeResponse(userId, {
            questionId: local.questionId,
            sectionId: local.sectionId,
            subsectionId: local.subsectionId,
            selectedAnswer: local.selectedAnswer,
            correctAnswer: local.correctAnswer || '',
            isCorrect: local.isCorrect || false,
          });
        }
      }
      
      // Return all responses (merged)
      const allResponses = await storage.getUserQuestionResponses(userId);
      res.json(allResponses);
    } catch (error) {
      console.error("Error syncing question responses:", error);
      res.status(500).json({ message: "Failed to sync question responses." });
    }
  });

  // Spaced Repetition routes
  app.get('/api/spaced-repetition/due', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const [dueQuestions, reviewedQuestionIds, incorrectQuestionIds] = await Promise.all([
        storage.getUserDueQuestions(userId),
        storage.getUserSpacedRepetitionQuestionIds(userId),
        storage.getUserIncorrectQuestionIds(userId),
      ]);
      res.json({
        due: dueQuestions,
        reviewedQuestionIds,
        incorrectQuestionIds,
      });
    } catch (error) {
      console.error("Error fetching due questions:", error);
      res.status(500).json({ message: "Failed to fetch due questions." });
    }
  });

  app.post('/api/spaced-repetition/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { questionId, sectionId, subsectionId, quality: rawQuality } = req.body;

      if (!questionId || rawQuality === undefined) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      // Get existing SR data or create new
      let sr = await storage.getSpacedRepetition(userId, questionId);
      
      // Spaced intervals (comfortable for ~20 questions/day: fewer, longer intervals)
      const quality = Math.max(0, Math.min(5, rawQuality)); // 0-5 scale
      let repetitionCount = (sr?.repetitionCount || 0) + 1;
      let easeFactor = sr?.easeFactor || 2500;
      let interval = 1;

      if (quality >= 3) {
        // Correct or acceptable answer — space out more to avoid daily overload
        if (repetitionCount === 1) {
          interval = 3;   // first review in 3 days (was 1)
        } else if (repetitionCount === 2) {
          interval = 10;  // second review in 10 days (was 3)
        } else {
          const multiplier = Math.max(easeFactor / 100, 2.2); // grow at least 2.2x each time
          interval = Math.max(sr?.interval ?? 10, Math.round((sr?.interval || 10) * multiplier));
        }
      } else {
        // Incorrect or difficult answer - reset
        interval = 1;
        repetitionCount = 0;
      }

      // Update ease factor
      easeFactor = Math.max(1300, Math.round(easeFactor + (50 * quality - 150)));

      // Calculate next review date
      const nextReviewAt = new Date();
      nextReviewAt.setDate(nextReviewAt.getDate() + interval);

      const updatedSR = await storage.upsertSpacedRepetition({
        userId,
        questionId,
        sectionId: sectionId || '',
        subsectionId: subsectionId || '',
        repetitionCount,
        easeFactor,
        interval,
        nextReviewAt,
        lastReviewedAt: new Date(),
      });

      res.json(updatedSR);
    } catch (error) {
      console.error("Error updating spaced repetition:", error);
      res.status(500).json({ message: "Failed to update spaced repetition." });
    }
  });

  app.get('/api/spaced-repetition/:questionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const questionId = req.params.questionId;
      
      const sr = await storage.getSpacedRepetition(userId, questionId);
      res.json(sr || { nextReviewAt: new Date() });
    } catch (error) {
      console.error("Error fetching SR data:", error);
      res.status(500).json({ message: "Failed to fetch SR data." });
    }
  });

  // Topic Analytics routes
  app.get('/api/analytics/topics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const sectionId = req.query.sectionId as string | undefined;
      
      const topicStats = await storage.getTopicStats(userId, sectionId);
      res.json(topicStats);
    } catch (error) {
      console.error("Error fetching topic stats:", error);
      res.status(500).json({ message: "Failed to fetch topic stats." });
    }
  });

  // Subscription routes
  app.get('/api/subscription/plans', async (req: any, res) => {
    try {
      await storage.initializeSubscriptionPlans();
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans." });
    }
  });

  // Create Stripe Checkout Session (redirects user to Stripe's hosted checkout page)
  const { createCheckoutSession } = await import("./stripe");
  app.post('/api/subscription/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { planId } = req.body ?? {};
      if (!planId || typeof planId !== "string") {
        return res.status(400).json({ message: "Plan ID required." });
      }
      const user = await storage.getUser(userId);
      const result = await createCheckoutSession({
        userId,
        userEmail: user?.email ?? null,
        planId: planId.trim(),
      });
      if ("error" in result) {
        return res.status(400).json({ message: result.error });
      }
      res.json({ sessionUrl: result.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to start checkout." });
    }
  });

  // Fulfill after Payment Link checkout (session_id + planId from client)
  app.post("/api/subscription/fulfill", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const body = req.body ?? {};
      const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : "";
      const planId = typeof body.planId === "string" ? body.planId.trim() : "";
      if (!sessionId || !planId) {
        return res.status(400).json({ message: "session_id and planId required." });
      }
      const { fulfillFromCheckoutSession } = await import("./stripe");
      const result = await fulfillFromCheckoutSession(sessionId, userId, planId);
      if ("error" in result) {
        return res.status(400).json({ message: result.error });
      }
      res.json({ message: "Subscription activated." });
    } catch (error) {
      console.error("Error fulfilling subscription:", error);
      res.status(500).json({ message: "Failed to activate subscription." });
    }
  });

  // Get subscription details
  app.get('/api/subscription/details', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const user = await storage.getUser(userId);
      const hasInstitutionalAffiliation = !!user?.institutionalAccessAffiliation?.trim();
      const institutionalExpiresAt = user?.institutionalAccessExpiresAt ? new Date(user.institutionalAccessExpiresAt) : null;
      const institutionalExpired = institutionalExpiresAt !== null && institutionalExpiresAt <= new Date();
      const hasInstitutional = hasInstitutionalAffiliation && !institutionalExpired;
      const activeSubscription = await storage.getUserActiveSubscription(userId);

      if (hasInstitutional && !userHasPersonalSubscriptionAccess(user, activeSubscription)) {
        const daysRemaining = institutionalExpiresAt
          ? Math.max(0, Math.ceil((institutionalExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null;
        return res.json({
          plan: 'institutional',
          status: 'institutional',
          institutionalAffiliation: user?.institutionalAccessAffiliation?.trim() ?? '',
          endsAt: institutionalExpiresAt ? institutionalExpiresAt.toISOString() : undefined,
          trialEndsAt: undefined,
          daysRemaining,
          transactionCount: 0,
        });
      }

      const now = new Date();
      const transactions = await storage.getUserSubscriptionTransactions(userId);
      const plans = await storage.getSubscriptionPlans();

      // Legacy plan names (DB may have old values): normalize for display and persist
      const LEGACY_PLAN_MAP: Record<string, string> = { '3-month': '1-year', '1-month': 'monthly' };
      const rawPlan = user?.subscriptionPlan;
      let planForDisplay = rawPlan;
      if (rawPlan && LEGACY_PLAN_MAP[rawPlan]) {
        planForDisplay = LEGACY_PLAN_MAP[rawPlan];
        await storage.updateUserProfile(userId, { subscriptionPlan: planForDisplay as any });
      }
      // Prefer plan from latest active transaction (reflects actual purchase)
      if (activeSubscription?.planId) {
        const txPlan = plans.find((p) => p.id === activeSubscription.planId);
        if (txPlan) {
          planForDisplay = txPlan.name;
          if (rawPlan !== txPlan.name) {
            await storage.updateUserProfile(userId, { subscriptionPlan: txPlan.name as any });
          }
        }
      }

      let status = user?.subscriptionStatus || 'trial';
      const trialEndsAt = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
      const userEndsAt = user?.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null;
      const activeEndDate = activeSubscription?.endDate ? new Date(activeSubscription.endDate) : null;
      const hasFutureAccess = (userEndsAt && userEndsAt.getTime() > now.getTime()) || (activeEndDate && activeEndDate.getTime() > now.getTime());

      // If trial period has ended, treat as active for display
      if (status === 'trial' && trialEndsAt && trialEndsAt.getTime() <= now.getTime()) {
        status = 'active';
      }
      // If user has future subscription end but DB says expired, treat as active and fix DB
      if (status === 'expired' && hasFutureAccess) {
        status = 'active';
        await storage.updateUserProfile(userId, { subscriptionStatus: 'active' as any });
        if (activeEndDate && !userEndsAt) {
          await storage.updateUserProfile(userId, { subscriptionEndsAt: activeEndDate as any });
        }
      }

      let daysRemaining: number | null = null;
      let endsAt: string | undefined;

      if (status === 'trial' && trialEndsAt) {
        daysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        endsAt = undefined;
      } else if (userEndsAt && (status === 'active' || status === 'canceled')) {
        daysRemaining = Math.max(0, Math.ceil((userEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        endsAt = userEndsAt.toISOString();
      } else if (activeEndDate && activeEndDate.getTime() > now.getTime()) {
        daysRemaining = Math.max(0, Math.ceil((activeEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        endsAt = activeEndDate.toISOString();
      } else if (activeSubscription?.endDate) {
        const endDate = new Date(activeSubscription.endDate);
        daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        endsAt = endDate.toISOString();
      } else {
        endsAt = undefined;
      }

      let planPrice: number | undefined;
      if (planForDisplay && planForDisplay !== 'institutional') {
        const plan = plans.find((p) => p.name === planForDisplay);
        if (plan) planPrice = plan.priceUSD;
      }

      res.json({
        plan: planForDisplay,
        status,
        endsAt,
        trialEndsAt: trialEndsAt?.toISOString() ?? undefined,
        daysRemaining,
        transactionCount: transactions.length,
        planPrice,
      });
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      res.status(500).json({ message: "Failed to fetch subscription details." });
    }
  });

  // Change subscription plan
  app.post('/api/subscription/change', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { planId } = req.body;

      if (!planId) {
        return res.status(400).json({ message: "Plan ID required." });
      }

      const plan = (await storage.getSubscriptionPlans()).find(p => p.id === planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found." });
      }

      // Create transaction
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);

      await storage.createSubscriptionTransaction({
        userId,
        planId,
        amount: plan.priceUSD,
        status: 'completed',
        startDate,
        endDate,
      });

      // Update user subscription
      await storage.updateUserProfile(userId, {
        subscriptionStatus: 'active',
        subscriptionPlan: plan.name as any,
        subscriptionEndsAt: endDate,
      });

      res.json({ message: "Subscription updated successfully." });
    } catch (error) {
      console.error("Error changing subscription:", error);
      res.status(500).json({ message: "Failed to change subscription." });
    }
  });

  // Cancel subscription (institutional: ends instantly; paid: immediate Stripe + Atlas end, no further charges).
  // User data (progress, notes, bookmarks, etc.) is never deleted; re-subscribing restores full access to the same account.
  app.post('/api/subscription/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const activeTx = await storage.getUserActiveSubscription(userId);
      if (userHasPersonalSubscriptionAccess(user, activeTx)) {
        await storage.cancelUserSubscription(userId);
        return res.json({
          message:
            "Your subscription was canceled immediately. You will not be charged again for this plan. If you were in a free trial, it has ended and you will not be billed.",
        });
      }

      if (user.institutionalAccessAffiliation?.trim()) {
        const now = new Date();
        const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
        const newStatus = trialEndsAt && trialEndsAt > now ? 'trial' : 'expired';
        await storage.updateUserProfile(userId, {
          institutionalAccessAffiliation: null as any,
          institutionalAccessExpiresAt: null as any,
          subscriptionStatus: newStatus,
        });
        return res.json({ message: "Institutional access removed. You can re-enter a code anytime to reactivate." });
      }

      await storage.cancelUserSubscription(userId);
      res.json({
        message:
          "Your subscription was canceled immediately. You will not be charged again for this plan. If you were in a free trial, it has ended and you will not be billed.",
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription." });
    }
  });

  // Redeem institutional access code (codes stored hashed in DB; user gets institution display name)
  app.post('/api/subscription/institutional-code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { code } = req.body;
      const raw = typeof code === 'string' ? code.trim() : '';
      if (!raw) {
        return res.status(400).json({ message: "Code is required." });
      }
      const institutionName = await storage.validateInstitutionalCode(raw);
      if (!institutionName) {
        return res.status(400).json({ message: "Invalid code." });
      }
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 365);
      await storage.updateUserProfile(userId, {
        institutionalAccessAffiliation: institutionName,
        institutionalAccessExpiresAt: expiresAt,
      });
      res.json({ message: "Access Granted!." });
    } catch (error: any) {
      console.error("Error redeeming institutional code:", error);
      const message = process.env.NODE_ENV !== "production" && error?.message
        ? error.message
        : "Failed to redeem code.";
      res.status(500).json({ message });
    }
  });

  // Oral Board Simulator routes
  const { initializeThread, sendMessage, validateThreadExists } = await import('./oralBoardService');

  app.post('/api/oral-board/init', isAuthenticated, async (req: any, res) => {
    try {
      const threadId = await initializeThread();
      res.json({ threadId });
    } catch (error) {
      console.error('Error initializing oral board thread:', error);
      res.status(500).json({ message: 'Failed to initialize oral board session.' });
    }
  });

  app.post('/api/oral-board/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { threadId, message } = req.body;

      if (!threadId || !message) {
        return res.status(400).json({ message: 'Missing threadId or message.' });
      }

      if (!validateThreadExists(threadId)) {
        return res.status(401).json({ message: 'Invalid thread ID.' });
      }

      const response = await sendMessage(threadId, message);
      res.json({ response });
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ message: 'Failed to process message.' });
    }
  });

  // Chat Bubble routes
  const { 
    initializeThread: initChatBubbleThread, 
    sendMessage: sendChatBubbleMessage, 
    validateThreadExists: validateChatBubbleThread 
  } = await import('./chatBubbleService');

  app.post('/api/chat-bubble/init', async (req: any, res) => {
    try {
      const threadId = await initChatBubbleThread();
      res.json({ threadId });
    } catch (error) {
      console.error('Error initializing chat bubble thread:', error);
      res.status(500).json({ message: 'Failed to initialize chat bubble session.' });
    }
  });

  app.post('/api/chat-bubble/chat', async (req: any, res) => {
    try {
      const { threadId, message } = req.body;

      if (!threadId || !message) {
        return res.status(400).json({ message: 'Missing threadId or message.' });
      }

      if (!validateChatBubbleThread(threadId)) {
        return res.status(401).json({ message: 'Invalid thread ID.' });
      }

      const response = await sendChatBubbleMessage(threadId, message);
      res.json({ response });
    } catch (error) {
      console.error('Error processing chat bubble message:', error);
      res.status(500).json({ message: 'Failed to process message.' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}