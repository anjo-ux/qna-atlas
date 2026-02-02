CREATE TABLE "bookmarks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"question_id" varchar NOT NULL,
	"section_id" varchar NOT NULL,
	"subsection_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "highlights" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"text" varchar NOT NULL,
	"color" varchar(20) DEFAULT 'yellow' NOT NULL,
	"section_id" varchar NOT NULL,
	"subsection_id" varchar NOT NULL,
	"location" varchar(20) NOT NULL,
	"question_id" varchar,
	"start_offset" integer NOT NULL,
	"end_offset" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_connections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"content" varchar NOT NULL,
	"section_id" varchar NOT NULL,
	"subsection_id" varchar NOT NULL,
	"location" varchar(20) NOT NULL,
	"question_id" varchar,
	"position_x" integer DEFAULT 100 NOT NULL,
	"position_y" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"test_session_id" varchar,
	"question_id" varchar NOT NULL,
	"section_id" varchar NOT NULL,
	"subsection_id" varchar NOT NULL,
	"selected_answer" varchar NOT NULL,
	"correct_answer" varchar DEFAULT '' NOT NULL,
	"is_correct" boolean NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"subsection_id" varchar(64) NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source" varchar(32) DEFAULT 'imported' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spaced_repetitions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"question_id" varchar NOT NULL,
	"section_id" varchar NOT NULL,
	"subsection_id" varchar NOT NULL,
	"repetition_count" integer DEFAULT 0 NOT NULL,
	"ease_factor" integer DEFAULT 2500 NOT NULL,
	"interval" integer DEFAULT 1 NOT NULL,
	"last_reviewed_at" timestamp,
	"next_review_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"duration_months" integer NOT NULL,
	"price_usd" integer NOT NULL,
	"stripe_price_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"stripe_payment_intent_id" varchar,
	"amount" integer NOT NULL,
	"status" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subsections" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"section_id" varchar(64) NOT NULL,
	"title" varchar NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"status" varchar(20) DEFAULT 'in-progress' NOT NULL,
	"question_count" integer NOT NULL,
	"use_all_questions" boolean DEFAULT false NOT NULL,
	"selected_section_ids" jsonb NOT NULL,
	"questions" jsonb NOT NULL,
	"current_question_index" integer DEFAULT 0 NOT NULL,
	"flagged_question_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" varchar,
	"username" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"avatar_icon" varchar DEFAULT 'smile',
	"theme_preference" varchar DEFAULT 'light',
	"institutional_affiliation" varchar,
	"subscription_status" varchar DEFAULT 'trial',
	"subscription_plan" varchar,
	"trial_ends_at" timestamp,
	"subscription_ends_at" timestamp,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"password_needs_reset" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_connections" ADD CONSTRAINT "login_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_test_session_id_test_sessions_id_fk" FOREIGN KEY ("test_session_id") REFERENCES "public"."test_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_subsection_id_subsections_id_fk" FOREIGN KEY ("subsection_id") REFERENCES "public"."subsections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaced_repetitions" ADD CONSTRAINT "spaced_repetitions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_transactions" ADD CONSTRAINT "subscription_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_transactions" ADD CONSTRAINT "subscription_transactions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subsections" ADD CONSTRAINT "subsections_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bookmarks_user_id" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_bookmarks_question" ON "bookmarks" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_bookmarks_user_question" ON "bookmarks" USING btree ("user_id","question_id");--> statement-breakpoint
CREATE INDEX "idx_highlights_user_id" ON "highlights" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_highlights_section" ON "highlights" USING btree ("section_id","subsection_id");--> statement-breakpoint
CREATE INDEX "idx_login_connections_user_id" ON "login_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notes_user_id" ON "notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notes_section" ON "notes" USING btree ("section_id","subsection_id");--> statement-breakpoint
CREATE INDEX "idx_question_responses_test_session" ON "question_responses" USING btree ("test_session_id");--> statement-breakpoint
CREATE INDEX "idx_question_responses_question" ON "question_responses" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_question_responses_user" ON "question_responses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_question_responses_section" ON "question_responses" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "idx_question_responses_user_section" ON "question_responses" USING btree ("user_id","section_id");--> statement-breakpoint
CREATE INDEX "idx_questions_subsection_id" ON "questions" USING btree ("subsection_id");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_sr_user_id" ON "spaced_repetitions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sr_question" ON "spaced_repetitions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_sr_next_review" ON "spaced_repetitions" USING btree ("next_review_at");--> statement-breakpoint
CREATE INDEX "idx_sr_user_question" ON "spaced_repetitions" USING btree ("user_id","question_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_name" ON "subscription_plans" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_subscription_transactions_user_id" ON "subscription_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_transactions_status" ON "subscription_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_subsections_section_id" ON "subsections" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "idx_test_sessions_user_id" ON "test_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_test_sessions_status" ON "test_sessions" USING btree ("status");