-- Institutional access codes (code stored as bcrypt hash)
CREATE TABLE IF NOT EXISTS "institutional_codes" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code_hash" varchar NOT NULL UNIQUE,
  "institution_name" varchar NOT NULL,
  "created_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_institutional_codes_code_hash" ON "institutional_codes" USING btree ("code_hash");
