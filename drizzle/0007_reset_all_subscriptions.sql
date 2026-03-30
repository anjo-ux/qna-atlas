-- One-time: reset all users to no subscription. All progress/data (responses, notes, bookmarks, etc.) is preserved.
-- Run manually: psql $DATABASE_URL -f drizzle/0007_reset_all_subscriptions.sql
-- Or set RUN_SUBSCRIPTION_RESET=true and start the server once (it runs this update on first request).
UPDATE "users"
SET
  "subscription_status" = 'expired',
  "trial_ends_at" = NULL,
  "subscription_ends_at" = NULL,
  "subscription_plan" = NULL,
  "institutional_access_affiliation" = NULL,
  "institutional_access_expires_at" = NULL,
  "stripe_customer_id" = NULL,
  "stripe_subscription_id" = NULL,
  "subscription_cancel_at_period_end" = false,
  "subscription_canceled_at" = NULL,
  "updated_at" = CURRENT_TIMESTAMP;
