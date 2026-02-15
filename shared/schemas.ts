import { createInsertSchema } from "drizzle-zod";
import { testSessions, questionResponses } from "./schema";
import { z } from "zod";

export const insertTestSessionSchema = createInsertSchema(testSessions).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
}) as any as z.ZodObject<any>;

export const updateTestSessionSchema = z.object({
  currentQuestionIndex: z.number().int().min(0).optional(),
  status: z.enum(['in-progress', 'completed']).optional(),
  questions: z.array(z.any()).optional(),
  flaggedQuestionIds: z.array(z.string()).optional(),
});

export type InsertTestSessionInput = z.infer<typeof insertTestSessionSchema> & Record<string, any>;
export type UpdateTestSessionInput = z.infer<typeof updateTestSessionSchema>;

// Question Response schemas
export const insertQuestionResponseSchema = z.object({
  testSessionId: z.string().nullable().optional(),
  questionId: z.string().min(1),
  sectionId: z.string().min(1),
  subsectionId: z.string().min(1),
  selectedAnswer: z.string().min(1),
  correctAnswer: z.string().optional(),
  isCorrect: z.boolean(),
});

export type InsertQuestionResponseInput = z.infer<typeof insertQuestionResponseSchema>;

export const insertQuestionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  subsectionId: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  source: z.enum(["imported", "generated"]).optional().default("generated"),
});
export type InsertQuestionInput = z.infer<typeof insertQuestionSchema>;
