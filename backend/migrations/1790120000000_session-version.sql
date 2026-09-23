-- Up Migration
-- every session token carries the value it was issued under; raising it ends them all at once
ALTER TABLE person ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0;

-- Down Migration
ALTER TABLE person DROP COLUMN session_version;
