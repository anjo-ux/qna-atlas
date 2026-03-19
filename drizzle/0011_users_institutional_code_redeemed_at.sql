-- One institutional code redemption per account (lifetime); not cleared when access is removed.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "institutional_code_redeemed_at" timestamp;
