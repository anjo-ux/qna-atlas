import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTestSessionSchema, updateTestSessionSchema, insertQuestionResponseSchema } from "@shared/schemas";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Allow unauthenticated access - return null if not logged in
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }
      
      const userId = req.user.claims.sub;
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
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { username, firstName, lastName, institutionalAffiliation, profileImageUrl } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        username,
        firstName,
        lastName,
        institutionalAffiliation,
        profileImageUrl,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Check subscription status
  app.get('/api/subscription', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json({ status: 'none', daysRemaining: 0, trialEndsAt: null, isLocked: false });
      }
      
      const user = await storage.getUser(req.user.claims.sub);
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
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json([]);
      }
      
      const userId = req.user.claims.sub;
      const connections = await storage.getLoginConnections(userId);
      res.json(connections.map(c => c.provider));
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  // Add login connection
  app.post('/api/auth/connections/:provider', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
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
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserTestSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching test sessions:", error);
      res.status(500).json({ message: "Failed to fetch test sessions" });
    }
  });

  app.get('/api/test-sessions/in-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getInProgressSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching in-progress sessions:", error);
      res.status(500).json({ message: "Failed to fetch in-progress sessions" });
    }
  });

  app.get('/api/test-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validationResult = insertQuestionResponseSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validationResult.error.flatten().fieldErrors
        });
      }
      
      const { testSessionId } = validationResult.data;
      
      // Verify the test session belongs to the user
      const session = await storage.getTestSession(testSessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const response = await storage.upsertQuestionResponse(validationResult.data);
      res.json(response);
    } catch (error) {
      console.error("Error saving question response:", error);
      res.status(500).json({ message: "Failed to save question response" });
    }
  });

  app.get('/api/test-sessions/:id/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const bookmarks = await storage.getUserBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const questionId = req.params.questionId;
      
      await storage.removeBookmark(userId, questionId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ message: "Failed to remove bookmark" });
    }
  });

  app.get('/api/bookmarks/check/:questionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const questionId = req.params.questionId;
      
      const isBookmarked = await storage.isQuestionBookmarked(userId, questionId);
      res.json({ isBookmarked });
    } catch (error) {
      console.error("Error checking bookmark:", error);
      res.status(500).json({ message: "Failed to check bookmark" });
    }
  });

  // Spaced Repetition routes
  app.get('/api/spaced-repetition/due', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dueQuestions = await storage.getUserDueQuestions(userId);
      res.json(dueQuestions);
    } catch (error) {
      console.error("Error fetching due questions:", error);
      res.status(500).json({ message: "Failed to fetch due questions" });
    }
  });

  app.post('/api/spaced-repetition/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      await storage.cancelUserSubscription(userId);
      res.json({ message: "Subscription canceled successfully" });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
