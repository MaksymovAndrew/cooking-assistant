-- Up Migration

-- per-meal limit is retired in favor of a single daily goal, which now covers both cases
ALTER TABLE person DROP COLUMN meal_calorie_limit;

-- Down Migration

ALTER TABLE person ADD COLUMN meal_calorie_limit INTEGER;
