import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Session storage table
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"), // For email/password auth (nullable for OAuth users)
  username: varchar("username"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  avatarIcon: varchar("avatar_icon").default('smile'),
  themePreference: varchar("theme_preference").default('light'), // 'light' or 'dark'
  institutionalAffiliation: varchar("institutional_affiliation"), // Profile only: user's registered/display affiliation (settings, signup)
  institutionalAccessAffiliation: varchar("institutional_access_affiliation"), // Display name from last code redeem; access requires redemption row + future expires_at
  institutionalAccessExpiresAt: timestamp("institutional_access_expires_at"), // End of code-granted access; must be in the future (with a redemption) to unlock
  /** Legacy timestamp; redemption limits use `user_institutional_code_redemptions` (per code per account). */
  institutionalCodeRedeemedAt: timestamp("institutional_code_redeemed_at"),
  subscriptionStatus: varchar("subscription_status").default('trial'), // trial, active, expired
  subscriptionPlan: varchar("subscription_plan"), // 1-month, 3-month, 6-month
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  subscriptionCancelAtPeriodEnd: boolean("subscription_cancel_at_period_end").notNull().default(false), // User canceled renewal; keep access until subscriptionEndsAt
  subscriptionCanceledAt: timestamp("subscription_canceled_at"), // When user requested cancellation (period-end for paid, immediate for trial)
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  /** Once true, user should use no-trial Payment Links / checkout (set on fulfill + cancel). */
  subscriptionTrialUsed: boolean("subscription_trial_used").notNull().default(false),
  passwordNeedsReset: boolean("password_needs_reset").default(false), // True if using temporary password
  tester: boolean("tester"), // True if user has beta access to Question Auth Platform (Atlas Trainer); set by admins; null/undefined treated as false
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Login connections table - tracks which OAuth providers user has connected
export const loginConnections = pgTable("login_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar("provider").notNull(), // 'google', 'apple', 'microsoft'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_login_connections_user_id").on(table.userId),
]);

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type LoginConnection = typeof loginConnections.$inferSelect;

/** Single-use password reset tokens (only SHA-256 hashes stored; plaintext token exists only in the email link). */
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("uidx_password_reset_tokens_hash").on(table.tokenHash),
    index("idx_password_reset_tokens_user_id").on(table.userId),
  ],
);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// Test Sessions table - tracks user's test progress
export const testSessions = pgTable("test_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar("status", { length: 20 }).notNull().default('in-progress'),
  questionCount: integer("question_count").notNull(),
  useAllQuestions: boolean("use_all_questions").notNull().default(false),
  selectedSectionIds: jsonb("selected_section_ids").$type<string[]>().notNull(),
  questions: jsonb("questions").notNull(), // Store the full Question objects for resume
  currentQuestionIndex: integer("current_question_index").notNull().default(0),
  flaggedQuestionIds: jsonb("flagged_question_ids").$type<string[]>().default([]).notNull(), // Store IDs of flagged questions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_test_sessions_user_id").on(table.userId),
  index("idx_test_sessions_status").on(table.status),
]);

export type InsertTestSession = typeof testSessions.$inferInsert;
export type TestSession = typeof testSessions.$inferSelect;

// Question Responses table - tracks answers to individual questions (study mode and test mode)
export const questionResponses = pgTable("question_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  testSessionId: varchar("test_session_id").references(() => testSessions.id, { onDelete: 'cascade' }), // Nullable for study mode
  questionId: varchar("question_id").notNull(),
  sectionId: varchar("section_id").notNull(),
  subsectionId: varchar("subsection_id").notNull(),
  selectedAnswer: varchar("selected_answer").notNull(),
  correctAnswer: varchar("correct_answer").notNull().default(''), // The correct answer for reference
  isCorrect: boolean("is_correct").notNull(),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
}, (table) => [
  index("idx_question_responses_test_session").on(table.testSessionId),
  index("idx_question_responses_question").on(table.questionId),
  index("idx_question_responses_user").on(table.userId),
  index("idx_question_responses_section").on(table.sectionId),
  index("idx_question_responses_user_section").on(table.userId, table.sectionId),
]);

export type InsertQuestionResponse = typeof questionResponses.$inferInsert;
export type QuestionResponse = typeof questionResponses.$inferSelect;

// Notes table - tracks user notes on highlights
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: varchar("content").notNull(),
  sectionId: varchar("section_id").notNull(),
  subsectionId: varchar("subsection_id").notNull(),
  location: varchar("location", { length: 20 }).notNull(), // 'reference' or 'question'
  questionId: varchar("question_id"),
  positionX: integer("position_x").notNull().default(100),
  positionY: integer("position_y").notNull().default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_notes_user_id").on(table.userId),
  index("idx_notes_section").on(table.sectionId, table.subsectionId),
]);

export type InsertNote = typeof notes.$inferInsert;
export type Note = typeof notes.$inferSelect;

// Highlights table - tracks user's text highlights
export const highlights = pgTable("highlights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  text: varchar("text").notNull(),
  color: varchar("color", { length: 20 }).notNull().default('yellow'), // 'yellow', 'green', 'blue', 'pink'
  sectionId: varchar("section_id").notNull(),
  subsectionId: varchar("subsection_id").notNull(),
  location: varchar("location", { length: 20 }).notNull(), // 'reference' or 'question'
  questionId: varchar("question_id"),
  startOffset: integer("start_offset").notNull(),
  endOffset: integer("end_offset").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_highlights_user_id").on(table.userId),
  index("idx_highlights_section").on(table.sectionId, table.subsectionId),
]);

export type InsertHighlight = typeof highlights.$inferInsert;
export type Highlight = typeof highlights.$inferSelect;

// Bookmarks table - tracks user's bookmarked questions
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  questionId: varchar("question_id").notNull(),
  sectionId: varchar("section_id").notNull(),
  subsectionId: varchar("subsection_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_bookmarks_user_id").on(table.userId),
  index("idx_bookmarks_question").on(table.questionId),
  index("idx_bookmarks_user_question").on(table.userId, table.questionId),
]);

export type InsertBookmark = typeof bookmarks.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;

// Spaced Repetition table - tracks SR algorithm state for questions
export const spacedRepetitions = pgTable("spaced_repetitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  questionId: varchar("question_id").notNull(),
  sectionId: varchar("section_id").notNull(),
  subsectionId: varchar("subsection_id").notNull(),
  repetitionCount: integer("repetition_count").notNull().default(0),
  easeFactor: integer("ease_factor").notNull().default(2500), // Stored as integer * 100 (so 2.5 = 2500)
  interval: integer("interval").notNull().default(1), // Days until next review
  lastReviewedAt: timestamp("last_reviewed_at"),
  nextReviewAt: timestamp("next_review_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_sr_user_id").on(table.userId),
  index("idx_sr_question").on(table.questionId),
  index("idx_sr_next_review").on(table.nextReviewAt),
  index("idx_sr_user_question").on(table.userId, table.questionId),
]);

export type InsertSpacedRepetition = typeof spacedRepetitions.$inferInsert;
export type SpacedRepetition = typeof spacedRepetitions.$inferSelect;

// Question bank: sections, subsections, questions (replaces Excel as source)
export const sections = pgTable("sections", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const subsections = pgTable("subsections", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sectionId: varchar("section_id", { length: 64 }).notNull().references(() => sections.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [index("idx_subsections_section_id").on(table.sectionId)]);

export const questions = pgTable("questions", {
  id: varchar("id", { length: 128 }).primaryKey(),
  subsectionId: varchar("subsection_id", { length: 64 }).notNull().references(() => subsections.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  source: varchar("source", { length: 32 }).notNull().default("imported"), // 'imported' | 'generated'
  visible: boolean("visible").notNull().default(true), // false = hidden from users (e.g. picture-based)
  /** True once auto-hidden due to user report volume (>=10); stays true if visibility is restored by admin */
  reported: boolean("reported").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [index("idx_questions_subsection_id").on(table.subsectionId)]);

export type InsertSection = typeof sections.$inferInsert;
export type SectionRow = typeof sections.$inferSelect;
export type InsertSubsection = typeof subsections.$inferInsert;
export type SubsectionRow = typeof subsections.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;
export type QuestionRow = typeof questions.$inferSelect;

// Subscription Plans table - stores available plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // '1-month', '3-month', '6-month'
  durationMonths: integer("duration_months").notNull(),
  priceUSD: integer("price_usd").notNull(), // in cents: 2500 = $25.00
  stripePriceId: varchar("stripe_price_id"),
  stripeProductId: varchar("stripe_product_id"), // Stripe product id (prod_xxx) for Checkout
  stripePaymentLinkUrl: varchar("stripe_payment_link_url"), // Payment Link URL (with trial); preferred when set
  /** Payment Link URL without free trial — used for returning subscribers (same price/interval as trial link). */
  stripePaymentLinkUrlNoTrial: varchar("stripe_payment_link_url_no_trial"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_subscription_plans_name").on(table.name),
]);

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

// Subscription Transactions table - tracks user purchases
export const subscriptionTransactions = pgTable("subscription_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: varchar("plan_id").notNull().references(() => subscriptionPlans.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  /** Stripe invoice id (in_xxx) when checkout created a subscription invoice — used for hosted invoice links */
  stripeInvoiceId: varchar("stripe_invoice_id"),
  amount: integer("amount").notNull(), // in cents
  /** pending | completed | failed | canceled (canceled = ended before period end; see canceledAt) */
  status: varchar("status").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  /** When the subscription/access for this row was canceled (e.g. user canceled or Stripe sub deleted). */
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_subscription_transactions_user_id").on(table.userId),
  index("idx_subscription_transactions_status").on(table.status),
]);

export type SubscriptionTransaction = typeof subscriptionTransactions.$inferSelect;
export type InsertSubscriptionTransaction = typeof subscriptionTransactions.$inferInsert;

// Institutional access codes (code stored as bcrypt hash; never store plaintext)
export const institutionalCodes = pgTable("institutional_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codeHash: varchar("code_hash").notNull().unique(),
  institutionName: varchar("institution_name").notNull(),
  /** When false, no new redemptions; existing users keep access until expiry / removal. */
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_institutional_codes_code_hash").on(table.codeHash),
  index("idx_institutional_codes_active").on(table.active),
]);

export type InstitutionalCode = typeof institutionalCodes.$inferSelect;
export type InsertInstitutionalCode = typeof institutionalCodes.$inferInsert;

/** Tracks which institutional codes each user has redeemed (same user cannot redeem the same code twice; unlimited other accounts may use the same code while it is active). */
export const userInstitutionalCodeRedemptions = pgTable(
  "user_institutional_code_redemptions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    institutionalCodeId: varchar("institutional_code_id")
      .notNull()
      .references(() => institutionalCodes.id, { onDelete: "cascade" }),
    redeemedAt: timestamp("redeemed_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("uidx_user_institutional_code").on(table.userId, table.institutionalCodeId),
    index("idx_user_institutional_redemptions_user_id").on(table.userId),
  ]
);

export type UserInstitutionalCodeRedemption = typeof userInstitutionalCodeRedemptions.$inferSelect;
export type InsertUserInstitutionalCodeRedemption = typeof userInstitutionalCodeRedemptions.$inferInsert;

// Question reports - user-reported issues with questions (also emailed to support)
export const questionReports = pgTable("question_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id", { length: 128 }).notNull(),
  message: text("message").notNull(),
  userEmail: varchar("user_email"), // null if submitted anonymously
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }), // null if anonymous
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_question_reports_question_id").on(table.questionId),
  index("idx_question_reports_created_at").on(table.createdAt),
]);

export type QuestionReport = typeof questionReports.$inferSelect;
export type InsertQuestionReport = typeof questionReports.$inferInsert;

/** Oral board simulator: one row per saved chat session (OpenAI thread + UI "Session N"). */
export const oralBoardSessions = pgTable(
  "oral_board_sessions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    openaiThreadId: varchar("openai_thread_id").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("idx_oral_board_sessions_user_id").on(table.userId)]
);

export const oralBoardMessages = pgTable(
  "oral_board_messages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    sessionId: varchar("session_id")
      .notNull()
      .references(() => oralBoardSessions.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_oral_board_messages_session_id").on(table.sessionId)]
);

export type OralBoardSession = typeof oralBoardSessions.$inferSelect;
export type InsertOralBoardSession = typeof oralBoardSessions.$inferInsert;
export type OralBoardMessage = typeof oralBoardMessages.$inferSelect;
export type InsertOralBoardMessage = typeof oralBoardMessages.$inferInsert;
