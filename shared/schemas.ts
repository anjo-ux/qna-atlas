import { createInsertSchema } from "drizzle-zod";
import { testSessions, questionResponses } from "./schema";
import { z } from "zod";

// Test Session schemas
const baseInsertTestSessionSchema = createInsertSchema(testSessions).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertTestSessionSchema = baseInsertTestSessionSchema;

export const updateTestSessionSchema = z.object({
  currentQuestionIndex: z.number().int().min(0).optional(),
  status: z.enum(['in-progress', 'completed']).optional(),
  questions: z.array(z.any()).optional(), // Validate as array at minimum
  flaggedQuestionIds: z.array(z.string()).optional(),
});

export type InsertTestSessionInput = z.infer<typeof insertTestSessionSchema>;
export type UpdateTestSessionInput = z.infer<typeof updateTestSessionSchema>;

// Question Response schemas
export const insertQuestionResponseSchema = createInsertSchema(questionResponses).omit({
  id: true,
  userId: true,  // Will be added by backend from authenticated session
  answeredAt: true,
});

export type InsertQuestionResponseInput = z.infer<typeof insertQuestionResponseSchema>;
