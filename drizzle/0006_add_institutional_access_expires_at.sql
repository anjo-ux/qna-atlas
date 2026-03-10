-- Institutional access can expire (e.g. Emory code valid 365 days from activation)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "institutional_access_expires_at" timestamp;

-- Existing Emory users: set expiry to 365 days from today
UPDATE "users"
SET "institutional_access_expires_at" = (CURRENT_TIMESTAMP + interval '365 days')
WHERE TRIM("institutional_access_affiliation") = 'Emory University'
  AND "institutional_access_expires_at" IS NULL;
