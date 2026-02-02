-- Add visible column to questions (default true; false = hidden from users)
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "visible" boolean DEFAULT true NOT NULL;
