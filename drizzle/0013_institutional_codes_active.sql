-- Shared institutional codes: many accounts can redeem while active; inactive = no new redemptions only.
ALTER TABLE "institutional_codes" ADD COLUMN IF NOT EXISTS "active" boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS "idx_institutional_codes_active" ON "institutional_codes" USING btree ("active");
