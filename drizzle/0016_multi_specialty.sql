-- Multi-specialty platform (prs-atlas.com + ortho-atlas.com).
-- Every pre-existing row belongs to Plastic Surgery ('prs'), so defaults double as the backfill.

-- 1. Which q-bank a user is viewing, and which one they signed up for.
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "active_specialty_id" varchar(32) NOT NULL DEFAULT 'prs';
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "signup_specialty_id" varchar(32) NOT NULL DEFAULT 'prs';

-- 2. Content ownership. Ortho sections/subsections use 'ortho-' prefixed ids so global PKs never collide.
ALTER TABLE "sections"
  ADD COLUMN IF NOT EXISTS "specialty_id" varchar(32) NOT NULL DEFAULT 'prs';
CREATE INDEX IF NOT EXISTS "idx_sections_specialty_id" ON "sections" ("specialty_id");

-- 3. Plans and purchases are per specialty (separate Stripe products / Payment Links per q-bank).
ALTER TABLE "subscription_plans"
  ADD COLUMN IF NOT EXISTS "specialty_id" varchar(32) NOT NULL DEFAULT 'prs';
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_subscription_plans_specialty_name"
  ON "subscription_plans" ("specialty_id", "name");

ALTER TABLE "subscription_transactions"
  ADD COLUMN IF NOT EXISTS "specialty_id" varchar(32) NOT NULL DEFAULT 'prs';
CREATE INDEX IF NOT EXISTS "idx_subscription_transactions_user_specialty"
  ON "subscription_transactions" ("user_id", "specialty_id");

-- 4. Institutional codes unlock exactly one q-bank.
ALTER TABLE "institutional_codes"
  ADD COLUMN IF NOT EXISTS "specialty_id" varchar(32) NOT NULL DEFAULT 'prs';
ALTER TABLE "user_institutional_code_redemptions"
  ADD COLUMN IF NOT EXISTS "specialty_id" varchar(32) NOT NULL DEFAULT 'prs';
CREATE INDEX IF NOT EXISTS "idx_user_institutional_redemptions_user_specialty"
  ON "user_institutional_code_redemptions" ("user_id", "specialty_id");

-- 5. Per-specialty entitlement. One row per (user, specialty); a user may hold both at once.
CREATE TABLE IF NOT EXISTS "user_specialty_subscriptions" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "specialty_id" varchar(32) NOT NULL,
  "subscription_status" varchar NOT NULL DEFAULT 'expired',
  "subscription_plan" varchar,
  "trial_ends_at" timestamp,
  "subscription_ends_at" timestamp,
  "subscription_cancel_at_period_end" boolean NOT NULL DEFAULT false,
  "subscription_canceled_at" timestamp,
  "stripe_subscription_id" varchar,
  "subscription_trial_used" boolean NOT NULL DEFAULT false,
  "institutional_access_affiliation" varchar,
  "institutional_access_expires_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_user_specialty_subscription"
  ON "user_specialty_subscriptions" ("user_id", "specialty_id");
CREATE INDEX IF NOT EXISTS "idx_user_specialty_subscriptions_user_id"
  ON "user_specialty_subscriptions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_specialty_subscriptions_stripe_sub"
  ON "user_specialty_subscriptions" ("stripe_subscription_id");

-- 6. Backfill: copy every existing user's entitlement into their Plastic Surgery row.
INSERT INTO "user_specialty_subscriptions" (
  "user_id",
  "specialty_id",
  "subscription_status",
  "subscription_plan",
  "trial_ends_at",
  "subscription_ends_at",
  "subscription_cancel_at_period_end",
  "subscription_canceled_at",
  "stripe_subscription_id",
  "subscription_trial_used",
  "institutional_access_affiliation",
  "institutional_access_expires_at"
)
SELECT
  u."id",
  'prs',
  COALESCE(u."subscription_status", 'expired'),
  u."subscription_plan",
  u."trial_ends_at",
  u."subscription_ends_at",
  COALESCE(u."subscription_cancel_at_period_end", false),
  u."subscription_canceled_at",
  u."stripe_subscription_id",
  COALESCE(u."subscription_trial_used", false),
  u."institutional_access_affiliation",
  u."institutional_access_expires_at"
FROM "users" u
ON CONFLICT ("user_id", "specialty_id") DO NOTHING;
