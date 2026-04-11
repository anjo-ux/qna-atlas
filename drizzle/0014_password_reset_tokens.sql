CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" varchar(64) NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_password_reset_tokens_hash"
  ON "password_reset_tokens" ("token_hash");
CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_user_id"
  ON "password_reset_tokens" ("user_id");
