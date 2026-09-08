-- Trial codes: 30-day access from redemption, once per account. Does not consume the 7-day Stripe intro trial.
ALTER TABLE "institutional_codes"
  ADD COLUMN IF NOT EXISTS "code_type" varchar(32) NOT NULL DEFAULT 'institutional';
