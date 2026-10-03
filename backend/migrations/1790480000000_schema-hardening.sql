-- Up Migration

-- rows the constraints below would refuse; the API never wrote any of them
DELETE FROM menu_recipe WHERE menu_id IS NULL OR recipe_id IS NULL;
DELETE FROM menu_recipe mr
USING menu_recipe keep
WHERE mr.menu_id = keep.menu_id
  AND mr.recipe_id = keep.recipe_id
  AND mr.menu_recipe_id > keep.menu_recipe_id;
DELETE FROM menu WHERE person_id IS NULL;
UPDATE menu SET category_id = (SELECT min(menu_category_id) FROM menu_category)
WHERE category_id IS NULL;
DELETE FROM ingredient_purchases WHERE quantity <= 0;
UPDATE recipe_ingredients SET quantity_recipe_ingredients = 1 WHERE quantity_recipe_ingredients <= 0;
UPDATE person_ingredients SET quantity_person_ingradient = 0 WHERE quantity_person_ingradient < 0;
UPDATE recipes SET cooking_time = NULL WHERE cooking_time <= 0;
UPDATE person SET calorie_goal = NULL WHERE calorie_goal <= 0;
DELETE FROM calorie_intake WHERE portions <= 0;

-- older dumps carry these keys under other names and without cascades, so all of them are rebuilt
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT conrelid::regclass AS tbl, conname
        FROM pg_constraint
        WHERE contype = 'f' AND conrelid IN ('menu'::regclass, 'menu_recipe'::regclass)
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.tbl, fk.conname);
    END LOOP;
END $$;

ALTER TABLE menu
    ALTER COLUMN person_id SET NOT NULL,
    ALTER COLUMN category_id SET NOT NULL,
    ADD CONSTRAINT menu_person_id_fkey FOREIGN KEY (person_id) REFERENCES person (id) ON DELETE CASCADE,
    ADD CONSTRAINT menu_category_id_fkey FOREIGN KEY (category_id) REFERENCES menu_category (menu_category_id) ON DELETE RESTRICT;

-- a recipe deleted by its author leaves the menus that held it
ALTER TABLE menu_recipe
    ALTER COLUMN menu_id SET NOT NULL,
    ALTER COLUMN recipe_id SET NOT NULL,
    ADD CONSTRAINT menu_recipe_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES menu (menu_id) ON DELETE CASCADE,
    ADD CONSTRAINT menu_recipe_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
    ADD CONSTRAINT menu_recipe_menu_recipe_key UNIQUE (menu_id, recipe_id);

-- the unique key above leads with menu_id, so the old single-column index only duplicates it
DROP INDEX idx_menu_recipe_menu_id;

ALTER TABLE recipe_ingredients ADD CONSTRAINT recipe_ingredients_quantity_check CHECK (quantity_recipe_ingredients > 0);
ALTER TABLE ingredient_purchases ADD CONSTRAINT ingredient_purchases_quantity_check CHECK (quantity > 0);
ALTER TABLE person_ingredients ADD CONSTRAINT person_ingredients_quantity_check CHECK (quantity_person_ingradient >= 0);
ALTER TABLE recipes ADD CONSTRAINT recipes_cooking_time_check CHECK (cooking_time > 0);
ALTER TABLE person ADD CONSTRAINT person_calorie_goal_check CHECK (calorie_goal > 0);
ALTER TABLE calorie_intake ADD CONSTRAINT calorie_intake_portions_check CHECK (portions > 0);

-- the seed looks reference rows up by name, so each name must be unique
ALTER TABLE recipe_types ADD CONSTRAINT recipe_types_type_name_key UNIQUE (type_name);
ALTER TABLE menu_category ADD CONSTRAINT menu_category_category_name_key UNIQUE (category_name);
ALTER TABLE unit_measurement ADD CONSTRAINT unit_measurement_unit_name_key UNIQUE (unit_name);

-- foreign keys the joins and cascades walk, and the newest-first orders both lists page through
CREATE INDEX idx_calorie_intake_recipe ON calorie_intake (recipe_id);
CREATE INDEX idx_calorie_intake_menu ON calorie_intake (menu_id);
CREATE INDEX idx_person_ingredients_ingredient ON person_ingredients (ingredient_id);
CREATE INDEX idx_menu_category ON menu (category_id);
CREATE INDEX idx_menu_creation_date ON menu (creation_date DESC, menu_id DESC);
CREATE INDEX idx_recipes_creation_date ON recipes (creation_date DESC, id DESC);
CREATE INDEX idx_recipes_cooking_time ON recipes (cooking_time);

-- alpine's libc sorts by byte value ("Zupa" before "apple"); ICU sorts every alphabet, equality stays exact
ALTER TABLE recipes ALTER COLUMN title TYPE VARCHAR(255) COLLATE "und-x-icu";
ALTER TABLE menu ALTER COLUMN menu_title TYPE VARCHAR(100) COLLATE "und-x-icu";
ALTER TABLE ingredients ALTER COLUMN name TYPE VARCHAR(255) COLLATE "und-x-icu";
ALTER TABLE person_tags ALTER COLUMN name TYPE VARCHAR(40) COLLATE "und-x-icu";
ALTER TABLE shopping_list_items ALTER COLUMN name TYPE VARCHAR(120) COLLATE "und-x-icu";

-- Down Migration

ALTER TABLE shopping_list_items ALTER COLUMN name TYPE VARCHAR(120) COLLATE "default";
ALTER TABLE person_tags ALTER COLUMN name TYPE VARCHAR(40) COLLATE "default";
ALTER TABLE ingredients ALTER COLUMN name TYPE VARCHAR(255) COLLATE "default";
ALTER TABLE menu ALTER COLUMN menu_title TYPE VARCHAR(100) COLLATE "default";
ALTER TABLE recipes ALTER COLUMN title TYPE VARCHAR(255) COLLATE "default";

DROP INDEX idx_recipes_cooking_time;
DROP INDEX idx_recipes_creation_date;
DROP INDEX idx_menu_creation_date;
DROP INDEX idx_menu_category;
DROP INDEX idx_person_ingredients_ingredient;
DROP INDEX idx_calorie_intake_menu;
DROP INDEX idx_calorie_intake_recipe;

ALTER TABLE unit_measurement DROP CONSTRAINT unit_measurement_unit_name_key;
ALTER TABLE menu_category DROP CONSTRAINT menu_category_category_name_key;
ALTER TABLE recipe_types DROP CONSTRAINT recipe_types_type_name_key;

ALTER TABLE calorie_intake DROP CONSTRAINT calorie_intake_portions_check;
ALTER TABLE person DROP CONSTRAINT person_calorie_goal_check;
ALTER TABLE recipes DROP CONSTRAINT recipes_cooking_time_check;
ALTER TABLE person_ingredients DROP CONSTRAINT person_ingredients_quantity_check;
ALTER TABLE ingredient_purchases DROP CONSTRAINT ingredient_purchases_quantity_check;
ALTER TABLE recipe_ingredients DROP CONSTRAINT recipe_ingredients_quantity_check;

CREATE INDEX idx_menu_recipe_menu_id ON menu_recipe (menu_id);

ALTER TABLE menu_recipe
    DROP CONSTRAINT menu_recipe_menu_recipe_key,
    DROP CONSTRAINT menu_recipe_recipe_id_fkey,
    DROP CONSTRAINT menu_recipe_menu_id_fkey,
    ALTER COLUMN recipe_id DROP NOT NULL,
    ALTER COLUMN menu_id DROP NOT NULL,
    ADD CONSTRAINT fk_menu_id FOREIGN KEY (menu_id) REFERENCES menu (menu_id) ON DELETE CASCADE,
    ADD CONSTRAINT menu_recipe_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES recipes (id);

ALTER TABLE menu
    DROP CONSTRAINT menu_category_id_fkey,
    DROP CONSTRAINT menu_person_id_fkey,
    ALTER COLUMN category_id DROP NOT NULL,
    ALTER COLUMN person_id DROP NOT NULL,
    ADD CONSTRAINT menu_category_id_fkey FOREIGN KEY (category_id) REFERENCES menu_category (menu_category_id),
    ADD CONSTRAINT menu_person_id_fkey FOREIGN KEY (person_id) REFERENCES person (id);
