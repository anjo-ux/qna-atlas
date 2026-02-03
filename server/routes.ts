import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./customAuth";
import { insertTestSessionSchema, updateTestSessionSchema, insertQuestionResponseSchema, insertQuestionSchema } from "@shared/schemas";
import { validateQuestionFormat, contentRulesForGenerated } from "@shared/questionFormat";

const ADMIN_CODE = process.env.ADMIN_CODE || "1127";

function requireAdminCode(req: any): boolean {
  const code = req.headers["x-admin-code"];
  return code === ADMIN_CODE;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication middleware
  await setupAuth(app);

  // Admin: list generated draft questions (requires admin code; no auth)
  app.get("/api/admin/generated-questions", async (req: any, res) => {
    if (!requireAdminCode(req)) {
      return res.status(403).json({ message: "Invalid admin code" });
    }
    try {
      const drafts = await storage.getDraftGeneratedQuestions();
      res.json(drafts);
    } catch (error) {
      console.error("Error fetching draft questions:", error);
      res.status(500).json({ message: "Failed to fetch draft questions" });
    }
  });

  // Admin: trigger AI question generation (requires admin code; no auth). May take 30–60s.
  app.post("/api/admin/generate-questions", async (req: any, res) => {
    if (!requireAdminCode(req)) {
      return res.status(403).json({ message: "Invalid admin code" });
    }
    try {
      const { runQuestionGenerationJob } = await import("./jobs/questionGenerationJob");
      const result = await runQuestionGenerationJob();
      res.json(result);
    } catch (error) {
      console.error("Error running question generation:", error);
      res.status(500).json({
        message: "Question generation failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Questions API (sections with nested subsections and questions)
  app.get('/api/sections', isAuthenticated, async (req: any, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  // Create AI-generated question (authenticated; same path used by scheduled job)
  app.post('/api/questions', isAuthenticated, async (req: any, res) => {
    try {
      const validationResult = insertQuestionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.flatten().fieldErrors,
        });
      }
      const data = validationResult.data;
      if (data.source === "generated") {
        const formatResult = validateQuestionFormat(data.question, data.answer);
        if (!formatResult.valid) {
          return res.status(400).json({
            message: "Generated question failed format validation",
            errors: formatResult.errors,
          });
        }
        const contentResult = contentRulesForGenerated(data.question);
        if (!contentResult.pass) {
          return res.status(400).json({
            message: contentResult.reason ?? "Generated question failed content rules",
          });
        }
      }
      const { id } = await storage.createQuestion(data);
      res.status(201).json({ id });
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Update question visibility (push generated question live; requires auth OR valid admin code)
  app.patch('/api/questions/:id', async (req: any, res) => {
    const hasAuth = req.session?.userId;
    const hasCode = requireAdminCode(req);
    if (!hasAuth && !hasCode) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { id } = req.params;
      const { visible } = req.body;
      if (typeof visible !== "boolean") {
        return res.status(400).json({ message: "Body must include visible: boolean" });
      }
      const question = await storage.getQuestion(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      const updated = await storage.updateQuestionVisibility(id, visible);
      if (!updated) {
        return res.status(500).json({ message: "Failed to update question" });
      }
      res.json({ id, visible });
    } catch (error) {
      console.error("Error updating question visibility:", error);
      res.status(500).json({ message: "Failed to update question" });
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
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/auth/user', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { username, firstName, lastName, institutionalAffiliation, avatarIcon } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        username,
        firstName,
        lastName,
        institutionalAffiliation,
        avatarIcon,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Get user percentile rank
  app.get('/api/user/percentile', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const percentile = await storage.getUserPercentileRank(userId);
      res.json({ percentile });
    } catch (error) {
      console.error("Error calculating percentile:", error);
      res.status(500).json({ message: "Failed to calculate percentile" });
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

      // Emory University institutional affiliation override - unlimited access
      const hasEmoryAccess = user.institutionalAffiliation?.toLowerCase().includes('emory');
      if (hasEmoryAccess) {
        return res.json({ 
          status: 'institutional', 
          daysRemaining: -1,
          trialEndsAt: null,
          isLocked: false,
          subscriptionType: 'Institutional Affiliation'
        });
      }

      const now = new Date();
      const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
      
      let status = user.subscriptionStatus || 'trial';
      let daysRemaining = 0;

      if (trialEndsAt) {
        const diffTime = trialEndsAt.getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        if (daysRemaining === 0 && status === 'trial') {
          status = 'expired';
          await storage.updateUserProfile(user.id, { subscriptionStatus: 'expired' });
        }
      }

      res.json({ 
        status, 
        daysRemaining, 
        trialEndsAt,
        isLocked: status === 'expired'
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
      res.status(500).json({ message: "Failed to fetch connections" });
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
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { theme } = req.body;
      
      if (!theme || (theme !== 'light' && theme !== 'dark')) {
        return res.status(400).json({ message: "Invalid theme" });
      }
      
      const updatedTheme = await storage.updateThemePreference(userId, theme);
      res.json({ theme: updatedTheme });
    } catch (error) {
      console.error("Error updating theme preference:", error);
      res.status(500).json({ message: "Failed to update theme preference" });
    }
  });

  // Add login connection
  app.post('/api/auth/connections/:provider', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { provider } = req.params;
      
      await storage.addLoginConnection(userId, provider);
      res.json({ provider, added: true });
    } catch (error) {
      console.error("Error adding connection:", error);
      res.status(500).json({ message: "Failed to add connection" });
    }
  });

  // Remove login connection
  app.delete('/api/auth/connections/:provider', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { provider } = req.params;
      
      const connections = await storage.getLoginConnections(userId);
      if (connections.length <= 1) {
        return res.status(400).json({ message: "Cannot remove last connection" });
      }
      
      await storage.removeLoginConnection(userId, provider);
      res.json({ provider, removed: true });
    } catch (error) {
      console.error("Error removing connection:", error);
      res.status(500).json({ message: "Failed to remove connection" });
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
      res.status(500).json({ message: "Failed to fetch test sessions" });
    }
  });

  app.get('/api/test-sessions/in-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const sessions = await storage.getInProgressSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching in-progress sessions:", error);
      res.status(500).json({ message: "Failed to fetch in-progress sessions" });
    }
  });

  app.get('/api/test-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const session = await storage.getTestSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching test session:", error);
      res.status(500).json({ message: "Failed to fetch test session" });
    }
  });

  app.post('/api/test-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      
      // Validate request body
      const validationResult = insertTestSessionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validationResult.error.flatten().fieldErrors
        });
      }
      
      const sessionData = {
        ...validationResult.data,
        userId,
      };
      
      const session = await storage.createTestSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating test session:", error);
      res.status(500).json({ message: "Failed to create test session" });
    }
  });

  app.patch('/api/test-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const session = await storage.getTestSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate and whitelist allowed fields
      const validationResult = updateTestSessionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validationResult.error.errors 
        });
      }
      
      const updated = await storage.updateTestSession(req.params.id, validationResult.data);
      res.json(updated);
    } catch (error) {
      console.error("Error updating test session:", error);
      res.status(500).json({ message: "Failed to update test session" });
    }
  });

  app.post('/api/test-sessions/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const session = await storage.getTestSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const completed = await storage.completeTestSession(req.params.id);
      res.json(completed);
    } catch (error) {
      console.error("Error completing test session:", error);
      res.status(500).json({ message: "Failed to complete test session" });
    }
  });

  app.delete('/api/test-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const session = await storage.getTestSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTestSession(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting test session:", error);
      res.status(500).json({ message: "Failed to delete test session" });
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
          message: "Invalid request data",
          errors: validationResult.error.flatten().fieldErrors
        });
      }
      
      const { testSessionId } = validationResult.data;
      
      // Verify the test session belongs to the user (if testSessionId provided)
      if (testSessionId) {
        const session = await storage.getTestSession(testSessionId);
        if (!session || session.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
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
      res.status(500).json({ message: "Failed to save question response" });
    }
  });

  app.get('/api/test-sessions/:id/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const session = await storage.getTestSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const responses = await storage.getTestSessionResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
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
      res.status(500).json({ message: "Failed to fetch notes" });
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
      res.status(500).json({ message: "Failed to create note" });
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
        return res.status(404).json({ message: "Note not found" });
      }
      
      const updates: any = {};
      if (content !== undefined) updates.content = content;
      if (positionX !== undefined) updates.positionX = positionX;
      if (positionY !== undefined) updates.positionY = positionY;
      
      const updatedNote = await storage.updateNote(noteId, updates);
      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ message: "Failed to update note" });
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
        return res.status(404).json({ message: "Note not found" });
      }
      
      await storage.deleteNote(noteId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note" });
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
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { questionId, sectionId, subsectionId } = req.body;
      
      if (!questionId || !sectionId || !subsectionId) {
        return res.status(400).json({ message: "Missing required fields" });
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
      res.status(500).json({ message: "Failed to add bookmark" });
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
      res.status(500).json({ message: "Failed to remove bookmark" });
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
      res.status(500).json({ message: "Failed to check bookmark" });
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
      res.status(500).json({ message: "Failed to fetch highlights" });
    }
  });

  app.post('/api/highlights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { text, color, sectionId, subsectionId, location, questionId, startOffset, endOffset } = req.body;
      
      if (!text || !sectionId || !subsectionId || !location || startOffset === undefined || endOffset === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
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
      res.status(500).json({ message: "Failed to create highlight" });
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
        return res.status(404).json({ message: "Highlight not found" });
      }
      
      const updatedHighlight = await storage.updateHighlight(highlightId, updates);
      res.json(updatedHighlight);
    } catch (error) {
      console.error("Error updating highlight:", error);
      res.status(500).json({ message: "Failed to update highlight" });
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
        return res.status(404).json({ message: "Highlight not found" });
      }
      
      await storage.deleteHighlight(highlightId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting highlight:", error);
      res.status(500).json({ message: "Failed to delete highlight" });
    }
  });

  // Bulk sync highlights (for reconciling local and server data)
  app.post('/api/highlights/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { highlights: localHighlights } = req.body;
      
      if (!Array.isArray(localHighlights)) {
        return res.status(400).json({ message: "Invalid highlights data" });
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
      res.status(500).json({ message: "Failed to sync highlights" });
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
      res.status(500).json({ message: "Failed to fetch question responses" });
    }
  });

  app.put('/api/question-responses/:questionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const questionId = req.params.questionId;
      const { sectionId, subsectionId, selectedAnswer, correctAnswer, isCorrect } = req.body;
      
      if (!sectionId || !subsectionId || !selectedAnswer || isCorrect === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
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
      res.status(500).json({ message: "Failed to save question response" });
    }
  });

  // Delete all question responses for user
  app.delete('/api/question-responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      await storage.deleteAllStudyModeResponses(userId);
      res.json({ message: "All responses deleted" });
    } catch (error) {
      console.error("Error deleting all question responses:", error);
      res.status(500).json({ message: "Failed to delete question responses" });
    }
  });

  // Bulk sync question responses (for reconciling local and server data)
  app.post('/api/question-responses/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { responses: localResponses } = req.body;
      
      if (!Array.isArray(localResponses)) {
        return res.status(400).json({ message: "Invalid responses data" });
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
      res.status(500).json({ message: "Failed to sync question responses" });
    }
  });

  // Spaced Repetition routes
  app.get('/api/spaced-repetition/due', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const dueQuestions = await storage.getUserDueQuestions(userId);
      res.json(dueQuestions);
    } catch (error) {
      console.error("Error fetching due questions:", error);
      res.status(500).json({ message: "Failed to fetch due questions" });
    }
  });

  app.post('/api/spaced-repetition/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { questionId, sectionId, subsectionId, quality: rawQuality } = req.body;

      if (!questionId || rawQuality === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get existing SR data or create new
      let sr = await storage.getSpacedRepetition(userId, questionId);
      
      // Calculate new interval based on SM-2 algorithm (simplified)
      const quality = Math.max(0, Math.min(5, rawQuality)); // 0-5 scale
      let repetitionCount = (sr?.repetitionCount || 0) + 1;
      let easeFactor = sr?.easeFactor || 2500;
      let interval = 1;

      if (quality >= 3) {
        // Correct or acceptable answer
        if (repetitionCount === 1) {
          interval = 1;
        } else if (repetitionCount === 2) {
          interval = 3;
        } else {
          interval = Math.round((sr?.interval || 1) * (easeFactor / 100));
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
      res.status(500).json({ message: "Failed to update spaced repetition" });
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
      res.status(500).json({ message: "Failed to fetch SR data" });
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
      res.status(500).json({ message: "Failed to fetch topic stats" });
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
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Get subscription details
  app.get('/api/subscription/details', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const user = await storage.getUser(userId);
      const activeSubscription = await storage.getUserActiveSubscription(userId);
      const transactions = await storage.getUserSubscriptionTransactions(userId);

      let daysRemaining = 0;
      if (activeSubscription?.endDate) {
        const now = new Date();
        const endDate = new Date(activeSubscription.endDate);
        daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }

      res.json({
        plan: user?.subscriptionPlan,
        status: user?.subscriptionStatus || 'trial',
        endsAt: activeSubscription?.endDate,
        daysRemaining,
        transactionCount: transactions.length,
      });
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      res.status(500).json({ message: "Failed to fetch subscription details" });
    }
  });

  // Change subscription plan
  app.post('/api/subscription/change', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { planId } = req.body;

      if (!planId) {
        return res.status(400).json({ message: "Plan ID required" });
      }

      const plan = (await storage.getSubscriptionPlans()).find(p => p.id === planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
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

      res.json({ message: "Subscription updated successfully" });
    } catch (error) {
      console.error("Error changing subscription:", error);
      res.status(500).json({ message: "Failed to change subscription" });
    }
  });

  // Cancel subscription
  app.post('/api/subscription/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      await storage.cancelUserSubscription(userId);
      res.json({ message: "Subscription canceled successfully" });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
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
      res.status(500).json({ message: 'Failed to initialize oral board session' });
    }
  });

  app.post('/api/oral-board/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { threadId, message } = req.body;

      if (!threadId || !message) {
        return res.status(400).json({ message: 'Missing threadId or message' });
      }

      if (!validateThreadExists(threadId)) {
        return res.status(401).json({ message: 'Invalid thread ID' });
      }

      const response = await sendMessage(threadId, message);
      res.json({ response });
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ message: 'Failed to process message' });
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
      res.status(500).json({ message: 'Failed to initialize chat bubble session' });
    }
  });

  app.post('/api/chat-bubble/chat', async (req: any, res) => {
    try {
      const { threadId, message } = req.body;

      if (!threadId || !message) {
        return res.status(400).json({ message: 'Missing threadId or message' });
      }

      if (!validateChatBubbleThread(threadId)) {
        return res.status(401).json({ message: 'Invalid thread ID' });
      }

      const response = await sendChatBubbleMessage(threadId, message);
      res.json({ response });
    } catch (error) {
      console.error('Error processing chat bubble message:', error);
      res.status(500).json({ message: 'Failed to process message' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}