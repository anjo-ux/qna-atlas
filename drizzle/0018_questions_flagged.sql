-- Content-audit / validation flags: hidden from all specialty q-banks until unflagged
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "flagged" boolean DEFAULT false NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_questions_flagged" ON "questions" ("flagged");
