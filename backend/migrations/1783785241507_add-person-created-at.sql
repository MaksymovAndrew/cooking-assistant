-- Up Migration

ALTER TABLE person ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Down Migration

ALTER TABLE person DROP COLUMN created_at;