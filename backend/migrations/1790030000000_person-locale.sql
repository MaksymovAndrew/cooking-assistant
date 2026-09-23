-- Up Migration
ALTER TABLE person ADD COLUMN locale TEXT NOT NULL DEFAULT 'en';

-- Down Migration
ALTER TABLE person DROP COLUMN locale;
