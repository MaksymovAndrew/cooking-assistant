-- Up Migration

ALTER TABLE person ADD COLUMN email VARCHAR(255);
ALTER TABLE person ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE person ADD COLUMN email_verified_at TIMESTAMPTZ;

-- Down Migration

ALTER TABLE person DROP COLUMN email_verified_at;
ALTER TABLE person DROP CONSTRAINT unique_email;
ALTER TABLE person DROP COLUMN email;
