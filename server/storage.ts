import {
  users,
  testSessions,
  questionResponses,
  loginConnections,
  notes,
  highlights,
  bookmarks,
  spacedRepetitions,
  subscriptionPlans,
  subscriptionTransactions,
  sections,
  subsections,
  questions,
  type User,
  type UpsertUser,
  type TestSession,
  type InsertTestSession,
  type QuestionResponse,
  type InsertQuestionResponse,
  type LoginConnection,
  type Note,
  type InsertNote,
  type Highlight,
  type InsertHighlight,
  type Bookmark,
  type InsertBookmark,
  type SpacedRepetition,
  type InsertSpacedRepetition,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type SubscriptionTransaction,
  type InsertSubscriptionTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, desc, lte } from "drizzle-orm";

export type SectionDto = {
  id: string;
  title: string;
  subsections: { id: string; title: string; questions: { id: string; question: string; answer: string; category: string; subcategory: string; tags: string[] }[] }[];
};

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: Partial<UpsertUser>): Promise<User>;
  updateUserPassword(id: string, passwordHash: string, needsReset: boolean): Promise<User>;

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

  // Highlights operations
  createHighlight(highlight: InsertHighlight): Promise<Highlight>;
  getUserHighlights(userId: string): Promise<Highlight[]>;
  updateHighlight(id: string, updates: Partial<InsertHighlight>): Promise<Highlight>;
  deleteHighlight(id: string): Promise<void>;
  deleteHighlightsByLocation(userId: string, sectionId: string, subsectionId: string, location: string, questionId?: string): Promise<void>;

  // Study-mode question responses (without testSessionId)
  getUserQuestionResponses(userId: string): Promise<QuestionResponse[]>;
  upsertStudyModeResponse(userId: string, response: {
    questionId: string;
    sectionId: string;
    subsectionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }): Promise<QuestionResponse>;
  deleteAllStudyModeResponses(userId: string): Promise<void>;

  // Bookmarks operations
  addBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  removeBookmark(userId: string, questionId: string): Promise<void>;
  getUserBookmarks(userId: string): Promise<Bookmark[]>;
  isQuestionBookmarked(userId: string, questionId: string): Promise<boolean>;

  // Spaced Repetition operations
  upsertSpacedRepetition(sr: InsertSpacedRepetition): Promise<SpacedRepetition>;
  getSpacedRepetition(userId: string, questionId: string): Promise<SpacedRepetition | undefined>;
  getUserDueQuestions(userId: string): Promise<SpacedRepetition[]>;
  getUserSpacedRepetitionQuestionIds(userId: string): Promise<string[]>;
  getUserIncorrectQuestionIds(userId: string): Promise<string[]>;
  updateSpacedRepetition(id: string, updates: Partial<InsertSpacedRepetition>): Promise<SpacedRepetition>;

  // Topic Analytics operations
  getTopicStats(userId: string, sectionId?: string): Promise<{
    sectionId: string;
    sectionTitle?: string;
    total: number;
    correct: number;
    accuracy: number;
  }[]>;

  // Subscription operations
  initializeSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionTransaction(transaction: InsertSubscriptionTransaction): Promise<SubscriptionTransaction>;
  getUserActiveSubscription(userId: string): Promise<SubscriptionTransaction | undefined>;
  cancelUserSubscription(userId: string): Promise<void>;
  getUserSubscriptionTransactions(userId: string): Promise<SubscriptionTransaction[]>;

  // Theme preference operations
  getThemePreference(userId: string): Promise<string>;
  updateThemePreference(userId: string, theme: string): Promise<string>;

  // Percentile rank operations
  getUserPercentileRank(userId: string): Promise<number | null>;

  // Question bank (sections API)
  getSections(): Promise<SectionDto[]>;
}

export class DatabaseStorage implements IStorage {
  private chatBubbleThreads = new Map<string, { id: string; messages: unknown[] }>();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async updateUserPassword(userId: string, passwordHash: string, needsReset: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        passwordHash,
        passwordNeedsReset: needsReset,
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
    const conditions: any[] = [eq(notes.userId, userId)];
    
    if (sectionId && subsectionId) {
      conditions.push(eq(notes.sectionId, sectionId));
      conditions.push(eq(notes.subsectionId, subsectionId));
    }
    
    return await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .orderBy(desc(notes.createdAt));
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

  // Highlights operations
  async createHighlight(highlightData: InsertHighlight): Promise<Highlight> {
    const [highlight] = await db
      .insert(highlights)
      .values(highlightData)
      .returning();
    return highlight;
  }

  async getUserHighlights(userId: string): Promise<Highlight[]> {
    return await db
      .select()
      .from(highlights)
      .where(eq(highlights.userId, userId))
      .orderBy(desc(highlights.createdAt));
  }

  async updateHighlight(id: string, updates: Partial<InsertHighlight>): Promise<Highlight> {
    const [highlight] = await db
      .update(highlights)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(highlights.id, id))
      .returning();
    return highlight;
  }

  async deleteHighlight(id: string): Promise<void> {
    await db.delete(highlights).where(eq(highlights.id, id));
  }

  async deleteHighlightsByLocation(
    userId: string,
    sectionId: string,
    subsectionId: string,
    location: string,
    questionId?: string
  ): Promise<void> {
    const conditions = [
      eq(highlights.userId, userId),
      eq(highlights.sectionId, sectionId),
      eq(highlights.subsectionId, subsectionId),
      eq(highlights.location, location),
    ];
    
    if (questionId) {
      conditions.push(eq(highlights.questionId, questionId));
    }
    
    await db.delete(highlights).where(and(...conditions));
  }

  // Study-mode question responses (without testSessionId)
  async getUserQuestionResponses(userId: string): Promise<QuestionResponse[]> {
    return await db
      .select()
      .from(questionResponses)
      .where(eq(questionResponses.userId, userId))
      .orderBy(desc(questionResponses.answeredAt));
  }

  async upsertStudyModeResponse(userId: string, response: {
    questionId: string;
    sectionId: string;
    subsectionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }): Promise<QuestionResponse> {
    // Check if a response already exists for this user+question (study mode - no testSessionId)
    const [existing] = await db
      .select()
      .from(questionResponses)
      .where(
        and(
          eq(questionResponses.userId, userId),
          eq(questionResponses.questionId, response.questionId),
          // Study mode responses have no testSessionId
        )
      );

    if (existing) {
      // Update existing response
      const [updated] = await db
        .update(questionResponses)
        .set({
          selectedAnswer: response.selectedAnswer,
          correctAnswer: response.correctAnswer,
          isCorrect: response.isCorrect,
          answeredAt: new Date(),
        })
        .where(eq(questionResponses.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new response
      const [created] = await db
        .insert(questionResponses)
        .values({
          userId,
          testSessionId: null, // Study mode - no test session
          questionId: response.questionId,
          sectionId: response.sectionId,
          subsectionId: response.subsectionId,
          selectedAnswer: response.selectedAnswer,
          correctAnswer: response.correctAnswer,
          isCorrect: response.isCorrect,
        })
        .returning();
      return created;
    }
  }

  async deleteAllStudyModeResponses(userId: string): Promise<void> {
    await db
      .delete(questionResponses)
      .where(eq(questionResponses.userId, userId));
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

  // Spaced Repetition operations
  async upsertSpacedRepetition(srData: InsertSpacedRepetition): Promise<SpacedRepetition> {
    const [existing] = await db
      .select()
      .from(spacedRepetitions)
      .where(
        and(
          eq(spacedRepetitions.userId, srData.userId),
          eq(spacedRepetitions.questionId, srData.questionId)
        )
      );

    if (existing) {
      const [updated] = await db
        .update(spacedRepetitions)
        .set({
          ...srData,
          updatedAt: new Date(),
        })
        .where(eq(spacedRepetitions.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(spacedRepetitions)
        .values(srData)
        .returning();
      return created;
    }
  }

  async getSpacedRepetition(userId: string, questionId: string): Promise<SpacedRepetition | undefined> {
    const [result] = await db
      .select()
      .from(spacedRepetitions)
      .where(
        and(
          eq(spacedRepetitions.userId, userId),
          eq(spacedRepetitions.questionId, questionId)
        )
      );
    return result;
  }

  async getUserDueQuestions(userId: string): Promise<SpacedRepetition[]> {
    const now = new Date();
    return await db
      .select()
      .from(spacedRepetitions)
      .where(
        and(
          eq(spacedRepetitions.userId, userId),
          lte(spacedRepetitions.nextReviewAt, now)
        )
      )
      .orderBy(spacedRepetitions.nextReviewAt);
  }

  async getUserSpacedRepetitionQuestionIds(userId: string): Promise<string[]> {
    const rows = await db
      .select({ questionId: spacedRepetitions.questionId })
      .from(spacedRepetitions)
      .where(eq(spacedRepetitions.userId, userId));
    return rows.map((r) => r.questionId);
  }

  async getUserIncorrectQuestionIds(userId: string): Promise<string[]> {
    const rows = await db
      .selectDistinct({ questionId: questionResponses.questionId })
      .from(questionResponses)
      .where(and(eq(questionResponses.userId, userId), eq(questionResponses.isCorrect, false)));
    return rows.map((r) => r.questionId);
  }

  async updateSpacedRepetition(id: string, updates: Partial<InsertSpacedRepetition>): Promise<SpacedRepetition> {
    const [updated] = await db
      .update(spacedRepetitions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(spacedRepetitions.id, id))
      .returning();
    return updated;
  }

  async getSections(): Promise<SectionDto[]> {
    const sectionRows = await db.select().from(sections).orderBy(asc(sections.sortOrder));
    const subsectionRows = await db.select().from(subsections).orderBy(asc(subsections.sortOrder));
    const questionRows = await db.select().from(questions);
    const bySub = new Map<string, typeof questionRows>();
    for (const q of questionRows) {
      // Only include visible questions (hide picture-based etc.)
      if (q.visible === false) continue;
      const list = bySub.get(q.subsectionId) ?? [];
      list.push(q);
      bySub.set(q.subsectionId, list);
    }
    const bySec = new Map<string, typeof subsectionRows>();
    for (const s of subsectionRows) {
      const list = bySec.get(s.sectionId) ?? [];
      list.push(s);
      bySec.set(s.sectionId, list);
    }
    return sectionRows.map((sec) => {
      const subs = (bySec.get(sec.id) ?? []).map((sub) => ({
        id: sub.id,
        title: sub.title,
        questions: (bySub.get(sub.id) ?? []).map((q) => ({
          id: q.id,
          question: q.question,
          answer: q.answer,
          category: sec.id,
          subcategory: sub.id,
          tags: q.tags ?? [],
        })),
      }));
      return { id: sec.id, title: sec.title, subsections: subs };
    });
  }

  async createQuestion(data: {
    question: string;
    answer: string;
    subsectionId: string;
    tags?: string[];
    source?: string;
    visible?: boolean;
  }) {
    const id = crypto.randomUUID();
    const source = (data.source as "imported" | "generated") ?? "imported";
    const visible =
      data.visible !== undefined ? data.visible : source === "generated" ? false : true;
    await db.insert(questions).values({
      id,
      subsectionId: data.subsectionId,
      question: data.question,
      answer: data.answer,
      tags: data.tags ?? [],
      source,
      visible,
    });
    return { id };
  }

  async updateQuestionVisibility(id: string, visible: boolean): Promise<boolean> {
    const [updated] = await db
      .update(questions)
      .set({ visible, updatedAt: new Date() })
      .where(eq(questions.id, id))
      .returning({ id: questions.id });
    return !!updated;
  }

  async getQuestion(id: string) {
    const [row] = await db.select().from(questions).where(eq(questions.id, id));
    return row;
  }

  async getDraftGeneratedQuestions(): Promise<{ id: string; question: string; answer: string; subsectionId: string; createdAt: Date }[]> {
    const rows = await db
      .select({
        id: questions.id,
        question: questions.question,
        answer: questions.answer,
        subsectionId: questions.subsectionId,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .where(and(eq(questions.source, "generated"), eq(questions.visible, false)))
      .orderBy(desc(questions.createdAt));
    return rows;
  }

  // Topic Analytics operations
  async getTopicStats(userId: string, sectionId?: string): Promise<{
    sectionId: string;
    sectionTitle?: string;
    total: number;
    correct: number;
    accuracy: number;
  }[]> {
    const conditions: any[] = [eq(questionResponses.userId, userId)];
    if (sectionId) {
      conditions.push(eq(questionResponses.sectionId, sectionId));
    }

    const responses = await db
      .select()
      .from(questionResponses)
      .where(and(...conditions));

    // Group by section
    const statsMap = new Map<string, { total: number; correct: number }>();
    
    responses.forEach(r => {
      const key = r.sectionId;
      if (!statsMap.has(key)) {
        statsMap.set(key, { total: 0, correct: 0 });
      }
      const stats = statsMap.get(key)!;
      stats.total++;
      if (r.isCorrect) stats.correct++;
    });

    // Convert to array format
    return Array.from(statsMap.entries()).map(([sectionId, stats]) => ({
      sectionId,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }));
  }

  // Subscription operations
  async initializeSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    // Check if plans already exist
    const existing = await db.select().from(subscriptionPlans);
    if (existing.length > 0) return existing;

    // Initialize default plans
    const plans = [
      { name: '1-month', durationMonths: 1, priceUSD: 2500 }, // $25
      { name: '3-month', durationMonths: 3, priceUSD: 5000 },  // $50
      { name: '6-month', durationMonths: 6, priceUSD: 10000 }, // $100
    ];

    const result: SubscriptionPlan[] = [];
    for (const plan of plans) {
      const [inserted] = await db
        .insert(subscriptionPlans)
        .values(plan)
        .returning();
      result.push(inserted);
    }
    return result;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.durationMonths);
  }

  async createSubscriptionTransaction(transaction: InsertSubscriptionTransaction): Promise<SubscriptionTransaction> {
    const [created] = await db
      .insert(subscriptionTransactions)
      .values(transaction)
      .returning();
    return created;
  }

  async getUserActiveSubscription(userId: string): Promise<SubscriptionTransaction | undefined> {
    const now = new Date();
    const active = await db
      .select()
      .from(subscriptionTransactions)
      .where(
        and(
          eq(subscriptionTransactions.userId, userId),
          eq(subscriptionTransactions.status, 'completed'),
          lte(subscriptionTransactions.startDate, now)
        )
      )
      .orderBy(desc(subscriptionTransactions.endDate))
      .limit(1);
    return active[0];
  }

  async cancelUserSubscription(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        subscriptionStatus: 'expired',
        subscriptionPlan: undefined,
        subscriptionEndsAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getUserSubscriptionTransactions(userId: string): Promise<SubscriptionTransaction[]> {
    return await db
      .select()
      .from(subscriptionTransactions)
      .where(eq(subscriptionTransactions.userId, userId))
      .orderBy(desc(subscriptionTransactions.createdAt));
  }

  // Theme preference operations
  async getThemePreference(userId: string): Promise<string> {
    const [user] = await db
      .select({ themePreference: users.themePreference })
      .from(users)
      .where(eq(users.id, userId));
    return user?.themePreference || 'light';
  }

  async updateThemePreference(userId: string, theme: string): Promise<string> {
    const [updated] = await db
      .update(users)
      .set({
        themePreference: theme,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ themePreference: users.themePreference });
    return updated?.themePreference || 'light';
  }

  // Percentile rank operations
  async getUserPercentileRank(userId: string): Promise<number | null> {
    // Get user's accuracy
    const userResponses = await db
      .select()
      .from(questionResponses)
      .where(eq(questionResponses.userId, userId));
    
    if (userResponses.length === 0) {
      return null;
    }

    const userCorrect = userResponses.filter(r => r.isCorrect).length;
    const userAccuracy = (userCorrect / userResponses.length) * 100;

    // Get all users' accuracy percentages
    const allUsers = await db.select({ id: users.id }).from(users);
    
    let betterCount = 0;
    for (const user of allUsers) {
      const responses = await db
        .select()
        .from(questionResponses)
        .where(eq(questionResponses.userId, user.id));
      
      if (responses.length > 0) {
        const correct = responses.filter(r => r.isCorrect).length;
        const accuracy = (correct / responses.length) * 100;
        
        if (accuracy > userAccuracy) {
          betterCount++;
        }
      }
    }

    const percentile = Math.round(((allUsers.length - betterCount) / allUsers.length) * 100);
    return Math.min(100, Math.max(0, percentile));
  }

  async createChatBubbleThread(threadId: string) {
    this.chatBubbleThreads.set(threadId, { id: threadId, messages: [] });
  }

  async getChatBubbleThread(threadId: string) {
    return this.chatBubbleThreads.get(threadId);
  }
}

export const storage = new DatabaseStorage();
