-- Up Migration

-- servings was free-form text that nothing ever wrote but "1" and nothing ever displayed as
-- editable - ingredient quantities are already authored per single portion, so this column
-- described no real recipe property, only a client-side scaling preference
ALTER TABLE recipes DROP COLUMN servings;

-- author's manual value; NULL means "compute it from the ingredients"
ALTER TABLE recipes ADD COLUMN calories_override DOUBLE PRECISION;
-- maintained by the recipe write transaction so lists and filters stay a plain column read
ALTER TABLE recipes ADD COLUMN calories_computed DOUBLE PRECISION;

UPDATE recipes r SET calories_computed = (
    SELECT SUM(ri.quantity_recipe_ingredients * i.calories_per_unit)
    FROM recipe_ingredients ri
             JOIN ingredients i ON i.id = ri.ingredient_id
    WHERE ri.recipe_id = r.id
);

ALTER TABLE person
    ADD COLUMN calorie_goal INTEGER,
    ADD COLUMN calorie_goal_period VARCHAR(8),
    ADD COLUMN meal_calorie_limit INTEGER,
    ADD CONSTRAINT chk_calorie_goal_period
        CHECK (calorie_goal_period IN ('day', 'week', 'month'));

CREATE TABLE calorie_intake (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES person (id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes (id) ON DELETE SET NULL,
    menu_id INTEGER REFERENCES menu (menu_id) ON DELETE SET NULL,
    -- title/calories are a snapshot at logging time - editing or deleting the recipe/menu later
    -- must not rewrite history, hence ON DELETE SET NULL above rather than CASCADE
    title VARCHAR(255) NOT NULL,
    portions DOUBLE PRECISION NOT NULL,
    calories DOUBLE PRECISION NOT NULL,
    eaten_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calorie_intake_person_eaten ON calorie_intake (person_id, eaten_at DESC);

-- Down Migration

DROP TABLE IF EXISTS calorie_intake;

ALTER TABLE person
    DROP CONSTRAINT chk_calorie_goal_period,
    DROP COLUMN calorie_goal,
    DROP COLUMN calorie_goal_period,
    DROP COLUMN meal_calorie_limit;

ALTER TABLE recipes
    DROP COLUMN calories_computed,
    DROP COLUMN calories_override;

ALTER TABLE recipes ADD COLUMN servings VARCHAR(255);
