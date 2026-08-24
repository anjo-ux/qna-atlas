-- Contact intake persistence, question revision audit, weekly agent watermarks
CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(200) NOT NULL,
  "email" varchar(320) NOT NULL,
  "subject" varchar(200) NOT NULL,
  "message" text NOT NULL,
  "specialty_id" varchar(32) NOT NULL DEFAULT 'prs',
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_contact_messages_created_at" ON "contact_messages" USING btree ("created_at");

CREATE TABLE IF NOT EXISTS "question_revisions" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "question_id" varchar(128) NOT NULL,
  "action" varchar(32) NOT NULL,
  "previous_question" text,
  "previous_answer" text,
  "new_question" text,
  "new_answer" text,
  "source" varchar(64) NOT NULL DEFAULT 'feedback_agent',
  "rationale" text,
  "report_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "run_id" varchar,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_question_revisions_question_id" ON "question_revisions" USING btree ("question_id");
CREATE INDEX IF NOT EXISTS "idx_question_revisions_created_at" ON "question_revisions" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "idx_question_revisions_run_id" ON "question_revisions" USING btree ("run_id");

CREATE TABLE IF NOT EXISTS "agent_job_runs" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "job_name" varchar(64) NOT NULL,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "finished_at" timestamp,
  "status" varchar(20) NOT NULL DEFAULT 'running',
  "stats" jsonb DEFAULT '{}'::jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_agent_job_runs_job_name" ON "agent_job_runs" USING btree ("job_name");
CREATE INDEX IF NOT EXISTS "idx_agent_job_runs_started_at" ON "agent_job_runs" USING btree ("started_at");
