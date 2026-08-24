-- Shared agent memory + fine-tune examples
CREATE TABLE IF NOT EXISTS "agent_lessons" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "category" varchar(64) NOT NULL,
  "lesson" text NOT NULL,
  "fingerprint" varchar(64) NOT NULL,
  "source" varchar(64) NOT NULL DEFAULT 'feedback_agent',
  "evidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_agent_lessons_fingerprint" ON "agent_lessons" USING btree ("fingerprint");
CREATE INDEX IF NOT EXISTS "idx_agent_lessons_active" ON "agent_lessons" USING btree ("active");
CREATE INDEX IF NOT EXISTS "idx_agent_lessons_created_at" ON "agent_lessons" USING btree ("created_at");

CREATE TABLE IF NOT EXISTS "agent_finetune_examples" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "kind" varchar(32) NOT NULL,
  "messages" jsonb NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_agent_finetune_examples_kind" ON "agent_finetune_examples" USING btree ("kind");
CREATE INDEX IF NOT EXISTS "idx_agent_finetune_examples_created_at" ON "agent_finetune_examples" USING btree ("created_at");
