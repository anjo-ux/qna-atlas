import {
  users,
  testSessions,
  questionResponses,
  loginConnections,
  notes,
  bookmarks,
  type User,
  type UpsertUser,
  type TestSession,
  type InsertTestSession,
  type QuestionResponse,
  type InsertQuestionResponse,
  type LoginConnection,
  type Note,
  type InsertNote,
  type Bookmark,
  type InsertBookmark,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: Partial<UpsertUser>): Promise<User>;

  // Test Session operations
  createTestSession(session: InsertTestSession): Promise<TestSession>;
  getTestSession(id: string): Promise<TestSession | undefined>;
  getUserTestSessions(userId: string): Promise<TestSession[]>;
  getInProgressSessions(userId: string): Promise<TestSession[]>;
  updateTestSession(id: string, updates: Partial<InsertTestSession>): Promise<TestSession>;
  completeTestSession(id: string): Promise<TestSession>;
  deleteTestSession(id: string): Promise<void>;

  // Question Response operations
  createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse>;
  getTestSessionResponses(testSessionId: string): Promise<QuestionResponse[]>;
  upsertQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse>;

  // Login Connection operations
  getLoginConnections(userId: string): Promise<LoginConnection[]>;
  addLoginConnection(userId: string, provider: string): Promise<LoginConnection>;
  removeLoginConnection(userId: string, provider: string): Promise<void>;

  // Notes operations
  createNote(note: InsertNote): Promise<Note>;
  getUserNotes(userId: string, sectionId?: string, subsectionId?: string): Promise<Note[]>;
  updateNote(id: string, updates: Partial<InsertNote>): Promise<Note>;
  deleteNote(id: string): Promise<void>;

  // Bookmarks operations
  addBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  removeBookmark(userId: string, questionId: string): Promise<void>;
  getUserBookmarks(userId: string): Promise<Bookmark[]>;
  isQuestionBookmarked(userId: string, questionId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Test Session operations
  async createTestSession(sessionData: InsertTestSession): Promise<TestSession> {
    const [session] = await db
      .insert(testSessions)
      .values({
        ...sessionData,
        questions: sessionData.questions || [],
      })
      .returning();
    return session;
  }

  async getTestSession(id: string): Promise<TestSession | undefined> {
    const [session] = await db
      .select()
      .from(testSessions)
      .where(eq(testSessions.id, id));
    return session;
  }

  async getUserTestSessions(userId: string): Promise<TestSession[]> {
    return await db
      .select()
      .from(testSessions)
      .where(eq(testSessions.userId, userId))
      .orderBy(desc(testSessions.createdAt));
  }

  async getInProgressSessions(userId: string): Promise<TestSession[]> {
    return await db
      .select()
      .from(testSessions)
      .where(
        and(
          eq(testSessions.userId, userId),
          eq(testSessions.status, 'in-progress')
        )
      )
      .orderBy(desc(testSessions.createdAt));
  }

  async updateTestSession(id: string, updates: Partial<InsertTestSession>): Promise<TestSession> {
    const [session] = await db
      .update(testSessions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(testSessions.id, id))
      .returning();
    return session;
  }

  async completeTestSession(id: string): Promise<TestSession> {
    const [session] = await db
      .update(testSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(testSessions.id, id))
      .returning();
    return session;
  }

  async deleteTestSession(id: string): Promise<void> {
    await db
      .delete(testSessions)
      .where(eq(testSessions.id, id));
  }

  // Question Response operations
  async createQuestionResponse(responseData: InsertQuestionResponse): Promise<QuestionResponse> {
    const [response] = await db
      .insert(questionResponses)
      .values(responseData)
      .returning();
    return response;
  }

  async getTestSessionResponses(testSessionId: string): Promise<QuestionResponse[]> {
    return await db
      .select()
      .from(questionResponses)
      .where(eq(questionResponses.testSessionId, testSessionId));
  }

  async upsertQuestionResponse(responseData: InsertQuestionResponse): Promise<QuestionResponse> {
    // Try to find existing response first
    const [existing] = await db
      .select()
      .from(questionResponses)
      .where(
        and(
          eq(questionResponses.testSessionId, responseData.testSessionId),
          eq(questionResponses.questionId, responseData.questionId)
        )
      );

    if (existing) {
      // Update existing
      const [updated] = await db
        .update(questionResponses)
        .set({
          selectedAnswer: responseData.selectedAnswer,
          isCorrect: responseData.isCorrect,
          answeredAt: new Date(),
        })
        .where(eq(questionResponses.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new
      return await this.createQuestionResponse(responseData);
    }
  }

  // Login Connection operations
  async getLoginConnections(userId: string): Promise<LoginConnection[]> {
    return await db
      .select()
      .from(loginConnections)
      .where(eq(loginConnections.userId, userId));
  }

  async addLoginConnection(userId: string, provider: string): Promise<LoginConnection> {
    const [conn] = await db
      .insert(loginConnections)
      .values({ userId, provider })
      .onConflictDoNothing()
      .returning();
    return conn || (await db.select().from(loginConnections).where(and(eq(loginConnections.userId, userId), eq(loginConnections.provider, provider))).then(r => r[0]));
  }

  async removeLoginConnection(userId: string, provider: string): Promise<void> {
    await db
      .delete(loginConnections)
      .where(and(eq(loginConnections.userId, userId), eq(loginConnections.provider, provider)));
  }

  // Notes operations
  async createNote(noteData: InsertNote): Promise<Note> {
    const [note] = await db
      .insert(notes)
      .values(noteData)
      .returning();
    return note;
  }

  async getUserNotes(userId: string, sectionId?: string, subsectionId?: string): Promise<Note[]> {
    let query = db.select().from(notes).where(eq(notes.userId, userId));
    
    if (sectionId && subsectionId) {
      query = query.where(and(
        eq(notes.sectionId, sectionId),
        eq(notes.subsectionId, subsectionId)
      ));
    }
    
    return await query.orderBy(desc(notes.createdAt));
  }

  async updateNote(id: string, updates: Partial<InsertNote>): Promise<Note> {
    const [note] = await db
      .update(notes)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning();
    return note;
  }

  async deleteNote(id: string): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  // Bookmarks operations
  async addBookmark(bookmarkData: InsertBookmark): Promise<Bookmark> {
    const [bookmark] = await db
      .insert(bookmarks)
      .values(bookmarkData)
      .onConflictDoNothing()
      .returning();
    
    if (bookmark) return bookmark;
    
    // If it was a conflict (already exists), return the existing bookmark
    const [existing] = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, bookmarkData.userId),
          eq(bookmarks.questionId, bookmarkData.questionId)
        )
      );
    return existing;
  }

  async removeBookmark(userId: string, questionId: string): Promise<void> {
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.questionId, questionId)
        )
      );
  }

  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    return await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async isQuestionBookmarked(userId: string, questionId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.questionId, questionId)
        )
      );
    return !!result;
  }
}

export const storage = new DatabaseStorage();
