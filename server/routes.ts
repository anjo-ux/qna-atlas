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
  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, institutionalAffiliation } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        institutionalAffiliation,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
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
          errors: validationResult.error.errors 
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
          errors: validationResult.error.errors 
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

  const httpServer = createServer(app);
  return httpServer;
}
