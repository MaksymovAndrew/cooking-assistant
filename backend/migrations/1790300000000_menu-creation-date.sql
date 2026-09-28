-- Up Migration
-- menus written before this migration take its date; there is no earlier record of when they were made
ALTER TABLE menu ADD COLUMN creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Down Migration
ALTER TABLE menu DROP COLUMN creation_date;
