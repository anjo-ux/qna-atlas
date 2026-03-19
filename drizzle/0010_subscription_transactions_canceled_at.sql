-- When a user cancels, we mark the active row canceled (status + canceled_at) for accurate history UI.
ALTER TABLE "subscription_transactions" ADD COLUMN IF NOT EXISTS "canceled_at" timestamp;
