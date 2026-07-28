-- Up Migration

-- irreversible data wipe: this release replaces the whole ingredient catalog, so the old
-- ingredients/recipes/menus/pantry content cannot coexist with the new schema below.
-- accounts, recipe_types, and menu_category survive untouched. down migration restores the
-- SCHEMA only - deleted rows are gone for good, so take a fresh prod dump first if needed.
DELETE FROM menu_recipe;
DELETE FROM menu;
DELETE FROM recipes;
DELETE FROM ingredients;
DELETE FROM unit_measurement;

ALTER TABLE ingredients
    ADD COLUMN slug VARCHAR(255) NOT NULL,
    ADD COLUMN category VARCHAR(64) NOT NULL,
    ADD COLUMN calories_per_unit DOUBLE PRECISION;

ALTER TABLE ingredients ADD CONSTRAINT unique_slug UNIQUE (slug);
CREATE INDEX idx_ingredients_category ON ingredients (category);

-- table is empty at this point, so the USING expression only needs to satisfy the type checker
ALTER TABLE ingredients
    ALTER COLUMN allergens TYPE TEXT[] USING '{}'::TEXT[],
    ALTER COLUMN allergens SET DEFAULT '{}',
    ALTER COLUMN allergens SET NOT NULL;

-- the SERIAL sequence no longer starts at 1 after the wipe above, so a bare DEFAULT 1 would
-- point at a unit row that may not exist; the seed always sets id_unit_measurement explicitly
ALTER TABLE ingredients ALTER COLUMN id_unit_measurement DROP DEFAULT;

ALTER TABLE person_ingredients
    ALTER COLUMN quantity_person_ingradient TYPE DOUBLE PRECISION;

-- Down Migration

ALTER TABLE person_ingredients
    ALTER COLUMN quantity_person_ingradient TYPE INTEGER USING ROUND(quantity_person_ingradient)::INTEGER;

ALTER TABLE ingredients ALTER COLUMN id_unit_measurement SET DEFAULT 1;

ALTER TABLE ingredients
    ALTER COLUMN allergens DROP NOT NULL,
    ALTER COLUMN allergens DROP DEFAULT,
    ALTER COLUMN allergens TYPE VARCHAR(255) USING NULL;

DROP INDEX IF EXISTS idx_ingredients_category;
ALTER TABLE ingredients DROP CONSTRAINT unique_slug;

ALTER TABLE ingredients
    DROP COLUMN slug,
    DROP COLUMN category,
    DROP COLUMN calories_per_unit;
