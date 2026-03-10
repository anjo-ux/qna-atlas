-- Access-granting institution (set by code redemption only); separate from profile institutional_affiliation
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "institutional_access_affiliation" varchar;

-- Backfill: users who had institutional_affiliation set (old access) get it in the new access column
UPDATE "users"
SET "institutional_access_affiliation" = COALESCE(TRIM("institutional_access_affiliation"), TRIM("institutional_affiliation"))
WHERE "institutional_affiliation" IS NOT NULL AND TRIM("institutional_affiliation") != '';
