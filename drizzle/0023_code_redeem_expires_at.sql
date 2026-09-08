-- New codes cannot be redeemed after 90 days from creation. Already-granted access is unaffected.
ALTER TABLE "institutional_codes"
  ADD COLUMN IF NOT EXISTS "redeem_expires_at" timestamp;
