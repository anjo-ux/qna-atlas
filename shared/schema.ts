import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  boolean,
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
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  username: varchar("username"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  institutionalAffiliation: varchar("institutional_affiliation"),
  subscriptionStatus: varchar("subscription_status").default('trial'), // trial, active, expired
  trialEndsAt: timestamp("trial_ends_at"),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_test_sessions_user_id").on(table.userId),
  index("idx_test_sessions_status").on(table.status),
]);

export type InsertTestSession = typeof testSessions.$inferInsert;
export type TestSession = typeof testSessions.$inferSelect;

// Question Responses table - tracks answers to individual questions
export const questionResponses = pgTable("question_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  testSessionId: varchar("test_session_id").notNull().references(() => testSessions.id, { onDelete: 'cascade' }),
  questionId: varchar("question_id").notNull(),
  sectionId: varchar("section_id").notNull(),
  subsectionId: varchar("subsection_id").notNull(),
  selectedAnswer: varchar("selected_answer").notNull(),
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
