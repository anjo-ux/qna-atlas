-- One login identity per email across PRS Atlas and Ortho Atlas.
-- Postgres UNIQUE(email) is case-sensitive; this index is not.
UPDATE users AS u
SET email = lower(u.email)
WHERE u.email IS DISTINCT FROM lower(u.email)
  AND NOT EXISTS (
    SELECT 1 FROM users AS other
    WHERE other.id <> u.id AND lower(other.email) = lower(u.email)
  );

CREATE UNIQUE INDEX IF NOT EXISTS uidx_users_email_lower ON users (lower(email));
