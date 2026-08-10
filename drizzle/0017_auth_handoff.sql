-- Cross-domain auth handoff (prs-atlas.com ↔ ortho-atlas.com) + pending Stripe plan stash.

CREATE TABLE IF NOT EXISTS "auth_handoff_tokens" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" varchar(64) NOT NULL,
  "target_specialty_id" varchar(32) NOT NULL,
  "next_path" varchar(512) NOT NULL DEFAULT '/',
  "continue_external_url" varchar(1024),
  "expires_at" timestamp NOT NULL,
  "used_at" timestamp,
  "created_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_auth_handoff_tokens_hash"
  ON "auth_handoff_tokens" ("token_hash");
CREATE INDEX IF NOT EXISTS "idx_auth_handoff_tokens_user_id"
  ON "auth_handoff_tokens" ("user_id");

CREATE TABLE IF NOT EXISTS "pending_checkout_plans" (
  "user_id" varchar PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "plan_id" varchar NOT NULL REFERENCES "subscription_plans"("id") ON DELETE CASCADE,
  "specialty_id" varchar(32) NOT NULL DEFAULT 'prs',
  "updated_at" timestamp DEFAULT now() NOT NULL
);
