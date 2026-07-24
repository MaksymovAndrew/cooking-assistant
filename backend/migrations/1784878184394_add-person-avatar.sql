-- Up Migration

ALTER TABLE person ADD COLUMN avatar VARCHAR(32);

-- Down Migration

ALTER TABLE person DROP COLUMN avatar;
