-- Flag questions auto-hidden due to report volume
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "reported" boolean DEFAULT false NOT NULL;
