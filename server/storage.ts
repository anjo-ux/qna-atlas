import bcrypt from "bcrypt";
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
  institutionalCodes,
  userInstitutionalCodeRedemptions,
  questionReports,
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
  type QuestionReport,
  type InsertQuestionReport,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, asc, desc, lte, sql, count, inArray } from "drizzle-orm";

const INSTITUTIONAL_CODE_SALT_ROUNDS = 10;
let institutionalUserColumnsMigrationDone = false;
let institutionalRedemptionConsistencyMigrationDone = false;
let subscriptionResetDone = false;
let userInstitutionalRedemptionsTableDone = false;

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
  warmupSubscriptionSchema(): Promise<void>;
  initializeSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionTransaction(transaction: InsertSubscriptionTransaction): Promise<SubscriptionTransaction>;
  getUserActiveSubscription(userId: string): Promise<SubscriptionTransaction | undefined>;
  cancelUserSubscription(userId: string): Promise<void>;
  getUserSubscriptionTransactions(userId: string): Promise<SubscriptionTransaction[]>;
  /** Idempotent Stripe invoice handling (renewals). */
  getSubscriptionTransactionByStripeInvoiceId(invoiceId: string): Promise<SubscriptionTransaction | undefined>;
  getUserByStripeSubscriptionId(stripeSubscriptionId: string): Promise<User | undefined>;
  /** Users currently linked to Stripe subscriptions (for periodic reconciliation). */
  getUsersWithStripeSubscriptions(): Promise<User[]>;
  /** False if user already consumed intro trial (flag or any completed subscription purchase). */
  getIntroTrialEligibility(userId: string): Promise<boolean>;

  // Institutional codes (hashed in DB; validate returns institution display name)
  ensureInstitutionalCodesSeed(): Promise<void>;
  validateInstitutionalCode(plainCode: string): Promise<string | null>;
  /** Match plaintext to a code row; used for redeem (needs code id for per-code dedup). */
  resolveInstitutionalCode(plainCode: string): Promise<
    | { type: "ok"; institutionName: string; codeId: string }
    | { type: "inactive" }
    | { type: "not_found" }
  >;
  getInstitutionalCodesAdmin(): Promise<
    { id: string; institutionName: string; active: boolean; createdAt: Date | null }[]
  >;
  createInstitutionalCodeAdmin(plainCode: string, institutionName: string): Promise<{ id: string }>;
  setInstitutionalCodeActiveAdmin(id: string, active: boolean): Promise<boolean>;
  hasUserRedeemedInstitutionalCode(userId: string, institutionalCodeId: string): Promise<boolean>;
  recordInstitutionalCodeRedemption(userId: string, institutionalCodeId: string): Promise<void>;
  /** True if this account has redeemed at least one institutional code (access is still gated by expires_at). */
  userHasAnyInstitutionalRedemption(userId: string): Promise<boolean>;
  /**
   * If user has a code redemption row but no expiry (legacy), set 365 days from now.
   * Idempotent when expiry already set. Does nothing when there are no redemptions.
   */
  ensureInstitutionalAccessExpiryWhenMissing(userId: string, userHint?: User | undefined): Promise<void>;
  /** When RUN_SUBSCRIPTION_RESET=true, reset all users to no subscription once. Call at startup. */
  runSubscriptionResetIfRequested(): Promise<void>;

  // Theme preference operations
  getThemePreference(userId: string): Promise<string>;
  updateThemePreference(userId: string, theme: string): Promise<string>;

  // Percentile rank operations
  getUserPercentileRank(userId: string): Promise<number | null>;

  // Question bank (sections API)
  getSections(): Promise<SectionDto[]>;

  // Question reports
  createQuestionReport(report: InsertQuestionReport): Promise<QuestionReport>;
  getAllQuestionReports(): Promise<QuestionReport[]>;
  countQuestionReportsForQuestion(questionId: string): Promise<number>;
  /** If question exists, set visible=false and reported=true (idempotent). */
  hideQuestionDueToReports(questionId: string): Promise<boolean>;
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

  async updateUserTester(userId: string, tester: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ tester, updatedAt: new Date() })
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
          eq(questionResponses.testSessionId, responseData.testSessionId as any),
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

  async createQuestionReport(report: InsertQuestionReport): Promise<QuestionReport> {
    const [row] = await db.insert(questionReports).values(report).returning();
    if (!row) throw new Error("Failed to insert question report");
    return row;
  }

  async getAllQuestionReports(): Promise<QuestionReport[]> {
    return db.select().from(questionReports).orderBy(desc(questionReports.createdAt));
  }

  async countQuestionReportsForQuestion(questionId: string): Promise<number> {
    const [row] = await db
      .select({ n: count() })
      .from(questionReports)
      .where(eq(questionReports.questionId, questionId));
    return Number(row?.n ?? 0);
  }

  async hideQuestionDueToReports(questionId: string): Promise<boolean> {
    const [updated] = await db
      .update(questions)
      .set({ visible: false, reported: true, updatedAt: new Date() })
      .where(eq(questions.id, questionId))
      .returning({ id: questions.id });
    return !!updated;
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

  async updateQuestionText(id: string, question: string, answer: string): Promise<boolean> {
    const [updated] = await db
      .update(questions)
      .set({ question, answer, updatedAt: new Date() })
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
    await this.ensureSubscriptionPlansSync();
    return this.getSubscriptionPlans();
  }

  /** Payment Link URLs (with free trial) – used when set; otherwise fallback to product/price. */
  private static readonly PAYMENT_LINK_URLS: Record<string, string> = {
    monthly: 'https://buy.stripe.com/28E14m4X6dd36H8f2pcV202',
    '6-month': 'https://buy.stripe.com/7sYeVc0GQ7SJc1saM9cV201',
    '1-year': 'https://buy.stripe.com/aFaaEW2OY3Ct6H88E1cV200',
  };

  /**
   * Payment Links without a free trial (same products/prices as above, no trial in Stripe Dashboard).
   * Paste URLs here and/or set env: STRIPE_PAYMENT_LINK_MONTHLY_NO_TRIAL, _6_MONTH_, _1_YEAR_.
   */
  private static readonly PAYMENT_LINK_URLS_NO_TRIAL: Record<string, string> = {
    monthly: 'https://buy.stripe.com/00w14m2OYb4VfdE5rPcV203',
    '6-month': 'https://buy.stripe.com/14A8wO9dmb4V8PgbQdcV204',
    '1-year': 'https://buy.stripe.com/14A8wOahq6OF3uWf2pcV205',
  };

  private resolveNoTrialPaymentLink(planName: string): string {
    const envMap: Record<string, string | undefined> = {
      monthly: process.env.STRIPE_PAYMENT_LINK_MONTHLY_NO_TRIAL,
      '6-month': process.env.STRIPE_PAYMENT_LINK_6_MONTH_NO_TRIAL,
      '1-year': process.env.STRIPE_PAYMENT_LINK_1_YEAR_NO_TRIAL,
    };
    const fromEnv = envMap[planName]?.trim();
    if (fromEnv) return fromEnv;
    return (DatabaseStorage.PAYMENT_LINK_URLS_NO_TRIAL[planName] ?? '').trim();
  }

  /** Ensures DB columns for trial tracking and no-trial payment links exist (idempotent). */
  private async ensureSubscriptionTrialMigrations(): Promise<void> {
    await pool.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_trial_used" boolean NOT NULL DEFAULT false
    `);
    await pool.query(`
      ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "stripe_payment_link_url_no_trial" varchar
    `);
    await pool.query(`
      ALTER TABLE "subscription_transactions" ADD COLUMN IF NOT EXISTS "stripe_invoice_id" varchar
    `);
    await pool.query(`
      ALTER TABLE "subscription_transactions" ADD COLUMN IF NOT EXISTS "canceled_at" timestamp
    `);
    await pool.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_cancel_at_period_end" boolean NOT NULL DEFAULT false
    `);
    await pool.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_canceled_at" timestamp
    `);
  }

  /** Call once at server startup so user rows match schema before any getUser(). */
  async warmupSubscriptionSchema(): Promise<void> {
    await this.ensureSubscriptionTrialMigrations();
    await this.ensureInstitutionalCodesTable();
    await this.ensureInstitutionalUserAccessColumnsMigration();
    await this.ensureInstitutionalCodeRedeemedAtMigration();
    await this.ensureUserInstitutionalRedemptionsTable();
    await this.ensureInstitutionalAccessRedemptionConsistencyMigration();
  }

  /** Ensures the three subscription plans (monthly $50, 6-month $270, 1-year $450) exist and are up to date. */
  async ensureSubscriptionPlansSync(): Promise<void> {
    await this.ensureSubscriptionTrialMigrations();
    const targetPlans = [
      {
        name: 'monthly' as const,
        durationMonths: 1,
        priceUSD: 5000,
        stripeProductId: 'prod_U14VnZW3eRgkDL',
        stripePaymentLinkUrl: DatabaseStorage.PAYMENT_LINK_URLS.monthly,
        stripePaymentLinkUrlNoTrial: this.resolveNoTrialPaymentLink('monthly') || null,
      },
      {
        name: '6-month' as const,
        durationMonths: 6,
        priceUSD: 27000,
        stripeProductId: 'prod_U14WP9DcWZEZWi',
        stripePaymentLinkUrl: DatabaseStorage.PAYMENT_LINK_URLS['6-month'],
        stripePaymentLinkUrlNoTrial: this.resolveNoTrialPaymentLink('6-month') || null,
      },
      {
        name: '1-year' as const,
        durationMonths: 12,
        priceUSD: 45000,
        stripeProductId: 'prod_U14X6csDhWjhrk',
        stripePaymentLinkUrl: DatabaseStorage.PAYMENT_LINK_URLS['1-year'],
        stripePaymentLinkUrlNoTrial: this.resolveNoTrialPaymentLink('1-year') || null,
      },
    ];

    // Migrate old plan names to new
    const oneMonth = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, '1-month'));
    if (oneMonth.length > 0) {
      await db.update(subscriptionPlans).set({ name: 'monthly', durationMonths: 1, priceUSD: 5000, stripeProductId: 'prod_U14VnZW3eRgkDL' }).where(eq(subscriptionPlans.name, '1-month'));
    }
    const threeMonth = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, '3-month'));
    if (threeMonth.length > 0) {
      await db.update(subscriptionPlans).set({ name: '1-year', durationMonths: 12, priceUSD: 45000, stripeProductId: 'prod_U14X6csDhWjhrk' }).where(eq(subscriptionPlans.name, '3-month'));
    }
    const sixMonth = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, '6-month'));
    if (sixMonth.length > 0) {
      await db.update(subscriptionPlans).set({ priceUSD: 27000, stripeProductId: 'prod_U14WP9DcWZEZWi' }).where(eq(subscriptionPlans.name, '6-month'));
    }

    // Ensure each target plan exists and has correct Stripe product id and payment link URL
    for (const p of targetPlans) {
      const existing = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, p.name));
      const updatesFull = {
        durationMonths: p.durationMonths,
        priceUSD: p.priceUSD,
        stripeProductId: p.stripeProductId,
        stripePaymentLinkUrl: p.stripePaymentLinkUrl,
        stripePaymentLinkUrlNoTrial: p.stripePaymentLinkUrlNoTrial,
      };
      const updatesMinimal = { durationMonths: p.durationMonths, priceUSD: p.priceUSD, stripeProductId: p.stripeProductId };
      if (existing.length === 0) {
        try {
          await db.insert(subscriptionPlans).values({ name: p.name, ...updatesFull });
        } catch (err) {
          await db.insert(subscriptionPlans).values({ name: p.name, ...updatesMinimal });
        }
      } else {
        try {
          await db.update(subscriptionPlans).set(updatesFull).where(eq(subscriptionPlans.name, p.name));
        } catch (_) {
          await db.update(subscriptionPlans).set(updatesMinimal).where(eq(subscriptionPlans.name, p.name));
        }
      }
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    await this.ensureSubscriptionPlansSync();
    const all = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.durationMonths);
    const want = ['monthly', '6-month', '1-year'];
    const seen = new Set<string>();
    return all.filter((p) => {
      if (!want.includes(p.name) || seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
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

  /**
   * Cancel personal subscription:
   * - Active paid subscription: cancel at period end (no further renewal; access remains until existing end date).
   * - Active trial: cancel immediately (trial ends now; no conversion charge).
   * User content (responses, notes, bookmarks) is never deleted.
   */
  async cancelUserSubscription(userId: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return;

    const activeTx = await this.getUserActiveSubscription(userId);
    const canceledNow = new Date();

    const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const inActiveTrial =
      (user.subscriptionStatus || "").toLowerCase() === "trial" &&
      !!trialEndsAt &&
      trialEndsAt.getTime() > canceledNow.getTime();

    if (inActiveTrial) {
      if (user.stripeSubscriptionId?.trim()) {
        const { cancelStripeSubscriptionImmediately } = await import("./stripe");
        await cancelStripeSubscriptionImmediately(user.stripeSubscriptionId.trim());
      }

      if (activeTx) {
        await db
          .update(subscriptionTransactions)
          .set({
            status: "canceled",
            canceledAt: canceledNow,
          })
          .where(eq(subscriptionTransactions.id, activeTx.id));
      }

      await db
        .update(users)
        .set({
          subscriptionStatus: "expired",
          subscriptionPlan: null as any,
          subscriptionEndsAt: null as any,
          subscriptionCancelAtPeriodEnd: false,
          subscriptionCanceledAt: canceledNow,
          trialEndsAt: null as any,
          stripeSubscriptionId: null as any,
          subscriptionTrialUsed: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      return;
    }

    if (user.stripeSubscriptionId?.trim()) {
      const { cancelStripeSubscriptionAtPeriodEnd } = await import("./stripe");
      await cancelStripeSubscriptionAtPeriodEnd(user.stripeSubscriptionId.trim());
    }

    if (activeTx) {
      await db
        .update(subscriptionTransactions)
        .set({
          status: "canceled",
          canceledAt: canceledNow,
        })
        .where(eq(subscriptionTransactions.id, activeTx.id));
    }

    const activeEnd = activeTx?.endDate ? new Date(activeTx.endDate) : null;
    const userEnd = user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null;
    const periodEnd =
      userEnd && activeEnd
        ? userEnd.getTime() > activeEnd.getTime()
          ? userEnd
          : activeEnd
        : userEnd ?? activeEnd;

    await db
      .update(users)
      .set({
        subscriptionStatus: "active",
        subscriptionEndsAt: periodEnd ?? user.subscriptionEndsAt ?? null,
        subscriptionCancelAtPeriodEnd: true,
        subscriptionCanceledAt: canceledNow,
        trialEndsAt: null as any,
        subscriptionTrialUsed: true,
        updatedAt: new Date(),
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

  async getSubscriptionTransactionByStripeInvoiceId(
    invoiceId: string
  ): Promise<SubscriptionTransaction | undefined> {
    const id = invoiceId?.trim();
    if (!id) return undefined;
    const [row] = await db
      .select()
      .from(subscriptionTransactions)
      .where(eq(subscriptionTransactions.stripeInvoiceId, id))
      .limit(1);
    return row;
  }

  async getUserByStripeSubscriptionId(stripeSubscriptionId: string): Promise<User | undefined> {
    const sid = stripeSubscriptionId?.trim();
    if (!sid) return undefined;
    const [u] = await db.select().from(users).where(eq(users.stripeSubscriptionId, sid)).limit(1);
    return u;
  }

  async getUsersWithStripeSubscriptions(): Promise<User[]> {
    const rows = await db.select().from(users);
    return rows.filter((u) => !!u.stripeSubscriptionId?.trim());
  }

  async getIntroTrialEligibility(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    if (user.subscriptionTrialUsed) return false;
    const [row] = await db
      .select({ id: subscriptionTransactions.id })
      .from(subscriptionTransactions)
      .where(
        and(
          eq(subscriptionTransactions.userId, userId),
          inArray(subscriptionTransactions.status, ["completed", "canceled"])
        )
      )
      .limit(1);
    if (row) return false;
    return true;
  }

  // Ensure institutional_codes table exists (idempotent; safe if migration wasn't run)
  private async ensureInstitutionalCodesTable(): Promise<void> {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "institutional_codes" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "code_hash" varchar NOT NULL UNIQUE,
        "institution_name" varchar NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp DEFAULT now()
      )
    `);
    await pool.query(`
      ALTER TABLE "institutional_codes" ADD COLUMN IF NOT EXISTS "active" boolean NOT NULL DEFAULT true
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "idx_institutional_codes_code_hash" ON "institutional_codes" USING btree ("code_hash")
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "idx_institutional_codes_active" ON "institutional_codes" USING btree ("active")
    `);
  }

  /**
   * Add institutional access columns only. Profile `institutional_affiliation` is display/settings only and must
   * never grant access — access comes only from redeeming a code (redemptions table + these columns).
   */
  private async ensureInstitutionalUserAccessColumnsMigration(): Promise<void> {
    if (institutionalUserColumnsMigrationDone) return;
    institutionalUserColumnsMigrationDone = true;
    await pool.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "institutional_access_affiliation" varchar
    `);
    await pool.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "institutional_access_expires_at" timestamp
    `);
  }

  /**
   * Strip access fields for users with no code redemptions; backfill expiry for redeemers missing it.
   * Runs after `user_institutional_code_redemptions` exists.
   */
  private async ensureInstitutionalAccessRedemptionConsistencyMigration(): Promise<void> {
    if (institutionalRedemptionConsistencyMigrationDone) return;
    institutionalRedemptionConsistencyMigrationDone = true;
    await pool.query(`
      UPDATE "users" u
      SET "institutional_access_affiliation" = NULL,
          "institutional_access_expires_at" = NULL
      WHERE NOT EXISTS (
        SELECT 1 FROM "user_institutional_code_redemptions" r WHERE r.user_id = u.id
      )
      AND (
        (u.institutional_access_affiliation IS NOT NULL AND TRIM(u.institutional_access_affiliation) != '')
        OR u.institutional_access_expires_at IS NOT NULL
      )
    `);
    await pool.query(`
      UPDATE "users" u
      SET "institutional_access_expires_at" = CURRENT_TIMESTAMP + INTERVAL '365 days'
      WHERE EXISTS (
        SELECT 1 FROM "user_institutional_code_redemptions" r WHERE r.user_id = u.id
      )
      AND u.institutional_access_expires_at IS NULL
    `);
  }

  /** Legacy column; no longer used to gate redemption (per-code redemptions table is authoritative). */
  private async ensureInstitutionalCodeRedeemedAtMigration(): Promise<void> {
    await pool.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "institutional_code_redeemed_at" timestamp
    `);
  }

  private async ensureUserInstitutionalRedemptionsTable(): Promise<void> {
    if (userInstitutionalRedemptionsTableDone) return;
    userInstitutionalRedemptionsTableDone = true;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "user_institutional_code_redemptions" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "institutional_code_id" varchar NOT NULL REFERENCES "institutional_codes"("id") ON DELETE CASCADE,
        "redeemed_at" timestamp DEFAULT now()
      )
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uidx_user_institutional_code"
      ON "user_institutional_code_redemptions" ("user_id", "institutional_code_id")
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_institutional_redemptions_user_id"
      ON "user_institutional_code_redemptions" ("user_id")
    `);
  }

  /**
   * When RUN_SUBSCRIPTION_RESET=true, once per process: delete all subscription_transactions and clear
   * subscription + institutional access fields on every user. Preserves accounts, progress, notes, etc.
   * Unset env after deploy. Does not cancel Stripe — do that in Dashboard if needed.
   */
  private async ensureSubscriptionResetMigration(): Promise<void> {
    if (subscriptionResetDone || process.env.RUN_SUBSCRIPTION_RESET !== 'true') return;
    subscriptionResetDone = true;
    const { runFullSubscriptionDataReset } = await import("./subscriptionFullReset");
    const result = await runFullSubscriptionDataReset(pool);
    console.warn("[RUN_SUBSCRIPTION_RESET] Full subscription data reset:", result);
  }

  // Institutional codes (hashed in DB)
  async ensureInstitutionalCodesSeed(): Promise<void> {
    await this.ensureInstitutionalCodesTable();
    await this.ensureInstitutionalUserAccessColumnsMigration();
    await this.ensureInstitutionalCodeRedeemedAtMigration();
    await this.ensureUserInstitutionalRedemptionsTable();
    await this.ensureInstitutionalAccessRedemptionConsistencyMigration();
    await this.ensureSubscriptionResetMigration();

    const existing = await db.select().from(institutionalCodes).limit(1);
    if (existing.length > 0) return;

    const codeHash = await bcrypt.hash("1127", INSTITUTIONAL_CODE_SALT_ROUNDS);
    await db.insert(institutionalCodes).values({
      codeHash,
      institutionName: "Emory University",
      active: true,
    });
  }

  async runSubscriptionResetIfRequested(): Promise<void> {
    await this.ensureSubscriptionResetMigration();
  }

  async resolveInstitutionalCode(plainCode: string): Promise<
    | { type: "ok"; institutionName: string; codeId: string }
    | { type: "inactive" }
    | { type: "not_found" }
  > {
    await this.ensureInstitutionalCodesSeed();
    const rows = await db.select().from(institutionalCodes);
    const trimmed = plainCode.trim();
    if (!trimmed) return { type: "not_found" };
    for (const row of rows) {
      const match = await bcrypt.compare(trimmed, row.codeHash);
      if (match) {
        if (row.active === false) return { type: "inactive" };
        return { type: "ok", institutionName: row.institutionName, codeId: row.id };
      }
    }
    return { type: "not_found" };
  }

  async validateInstitutionalCode(plainCode: string): Promise<string | null> {
    const r = await this.resolveInstitutionalCode(plainCode);
    return r.type === "ok" ? r.institutionName : null;
  }

  async getInstitutionalCodesAdmin(): Promise<
    { id: string; institutionName: string; active: boolean; createdAt: Date | null }[]
  > {
    await this.ensureInstitutionalCodesSeed();
    const rows = await db
      .select({
        id: institutionalCodes.id,
        institutionName: institutionalCodes.institutionName,
        active: institutionalCodes.active,
        createdAt: institutionalCodes.createdAt,
      })
      .from(institutionalCodes)
      .orderBy(desc(institutionalCodes.createdAt));
    return rows.map((r) => ({
      id: r.id,
      institutionName: r.institutionName,
      active: r.active !== false,
      createdAt: r.createdAt ?? null,
    }));
  }

  async createInstitutionalCodeAdmin(plainCode: string, institutionName: string): Promise<{ id: string }> {
    await this.ensureInstitutionalCodesSeed();
    const trimmed = plainCode.trim();
    const name = institutionName.trim();
    if (!trimmed || !name) {
      throw new Error("plainCode and institutionName are required");
    }
    /** Bcrypt salts differ per row — detect duplicate plaintext by comparing against existing hashes. */
    const duplicate = await this.resolveInstitutionalCode(trimmed);
    if (duplicate.type === "ok" || duplicate.type === "inactive") {
      const err = new Error("An institutional code with this exact value already exists.");
      (err as NodeJS.ErrnoException).code = "23505";
      throw err;
    }
    const codeHash = await bcrypt.hash(trimmed, INSTITUTIONAL_CODE_SALT_ROUNDS);
    const [inserted] = await db
      .insert(institutionalCodes)
      .values({
        codeHash,
        institutionName: name,
        active: true,
      })
      .returning({ id: institutionalCodes.id });
    if (!inserted) throw new Error("Insert failed");
    return { id: inserted.id };
  }

  async setInstitutionalCodeActiveAdmin(id: string, active: boolean): Promise<boolean> {
    await this.ensureInstitutionalCodesSeed();
    const [updated] = await db
      .update(institutionalCodes)
      .set({ active })
      .where(eq(institutionalCodes.id, id))
      .returning({ id: institutionalCodes.id });
    return !!updated;
  }

  async hasUserRedeemedInstitutionalCode(userId: string, institutionalCodeId: string): Promise<boolean> {
    await this.ensureUserInstitutionalRedemptionsTable();
    const [row] = await db
      .select({ id: userInstitutionalCodeRedemptions.id })
      .from(userInstitutionalCodeRedemptions)
      .where(
        and(
          eq(userInstitutionalCodeRedemptions.userId, userId),
          eq(userInstitutionalCodeRedemptions.institutionalCodeId, institutionalCodeId)
        )
      )
      .limit(1);
    return !!row;
  }

  async recordInstitutionalCodeRedemption(userId: string, institutionalCodeId: string): Promise<void> {
    await this.ensureUserInstitutionalRedemptionsTable();
    await db.insert(userInstitutionalCodeRedemptions).values({
      userId,
      institutionalCodeId,
    });
  }

  async userHasAnyInstitutionalRedemption(userId: string): Promise<boolean> {
    await this.ensureUserInstitutionalRedemptionsTable();
    const [row] = await db
      .select({ id: userInstitutionalCodeRedemptions.id })
      .from(userInstitutionalCodeRedemptions)
      .where(eq(userInstitutionalCodeRedemptions.userId, userId))
      .limit(1);
    return !!row;
  }

  async ensureInstitutionalAccessExpiryWhenMissing(userId: string, userHint?: User | undefined): Promise<void> {
    const hasRedemption = await this.userHasAnyInstitutionalRedemption(userId);
    if (!hasRedemption) return;
    const u = userHint ?? (await this.getUser(userId));
    if (!u) return;
    if (u.institutionalAccessExpiresAt) return;
    const end = new Date();
    end.setDate(end.getDate() + 365);
    await this.updateUserProfile(userId, { institutionalAccessExpiresAt: end });
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
