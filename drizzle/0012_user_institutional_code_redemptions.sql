-- Track which institutional codes each user has redeemed (same code twice on same account = blocked; different codes OK).
CREATE TABLE IF NOT EXISTS "user_institutional_code_redemptions" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "institutional_code_id" varchar NOT NULL REFERENCES "institutional_codes"("id") ON DELETE CASCADE,
  "redeemed_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_user_institutional_code"
  ON "user_institutional_code_redemptions" ("user_id", "institutional_code_id");
CREATE INDEX IF NOT EXISTS "idx_user_institutional_redemptions_user_id"
  ON "user_institutional_code_redemptions" ("user_id");
