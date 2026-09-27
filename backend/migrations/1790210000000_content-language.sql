-- Up Migration
ALTER TABLE recipes ADD COLUMN language TEXT NOT NULL DEFAULT 'en'
    CHECK (language IN ('en', 'pl', 'ru', 'uk'));

ALTER TABLE menu ADD COLUMN language TEXT NOT NULL DEFAULT 'en'
    CHECK (language IN ('en', 'pl', 'ru', 'uk'));

-- existing records take the language their own text is written in: letters only Ukrainian has,
-- then any Cyrillic, then Polish diacritics; anything else stays English
UPDATE recipes SET language = CASE
    WHEN title || ' ' || content ~ '[іїєґІЇЄҐ]' THEN 'uk'
    WHEN title || ' ' || content ~ '[а-яёА-ЯЁ]' THEN 'ru'
    WHEN title || ' ' || content ~ '[ąćęłńśźżĄĆĘŁŃŚŹŻ]' THEN 'pl'
    ELSE 'en'
END;

UPDATE menu SET language = CASE
    WHEN menu_title || ' ' || COALESCE(menu_content, '') ~ '[іїєґІЇЄҐ]' THEN 'uk'
    WHEN menu_title || ' ' || COALESCE(menu_content, '') ~ '[а-яёА-ЯЁ]' THEN 'ru'
    WHEN menu_title || ' ' || COALESCE(menu_content, '') ~ '[ąćęłńśźżĄĆĘŁŃŚŹŻ]' THEN 'pl'
    ELSE 'en'
END;

-- Down Migration
ALTER TABLE menu DROP COLUMN language;

ALTER TABLE recipes DROP COLUMN language;
