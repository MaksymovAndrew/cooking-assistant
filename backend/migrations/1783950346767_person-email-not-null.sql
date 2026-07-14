-- Up Migration

-- backfill any legacy rows from before email was required, so the NOT NULL constraint below is safe on any environment
UPDATE person SET email = 'legacy-' || id || '@example.com' WHERE email IS NULL;
ALTER TABLE person ALTER COLUMN email SET NOT NULL;

-- Down Migration

ALTER TABLE person ALTER COLUMN email DROP NOT NULL;
