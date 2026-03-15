-- Question reports (user-reported issues with questions)
CREATE TABLE IF NOT EXISTS "question_reports" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "question_id" varchar(128) NOT NULL,
  "message" text NOT NULL,
  "user_email" varchar,
  "user_id" varchar REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_question_reports_question_id" ON "question_reports" USING btree ("question_id");
CREATE INDEX IF NOT EXISTS "idx_question_reports_created_at" ON "question_reports" USING btree ("created_at");
