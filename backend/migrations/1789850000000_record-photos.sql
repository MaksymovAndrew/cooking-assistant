-- Up Migration

-- the key names a pair of generated WebP files on disk; it is never derived from user input
ALTER TABLE recipes ADD COLUMN photo_key UUID;

ALTER TABLE menu ADD COLUMN photo_key UUID;

-- kept apart from the preset avatar key, so switching between an upload and a preset loses neither
ALTER TABLE person ADD COLUMN avatar_photo_key UUID;

-- Down Migration

ALTER TABLE person DROP COLUMN avatar_photo_key;

ALTER TABLE menu DROP COLUMN photo_key;

ALTER TABLE recipes DROP COLUMN photo_key;
