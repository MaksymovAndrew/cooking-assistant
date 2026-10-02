-- Up Migration

-- one row per "Cooked it"; title is a snapshot, so the sources go NULL instead of taking the history with them
CREATE TABLE pantry_consumptions (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES person (id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes (id) ON DELETE SET NULL,
    menu_id INTEGER REFERENCES menu (menu_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    portions INTEGER NOT NULL CHECK (portions > 0),
    cooked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    undone_at TIMESTAMPTZ CHECK (undone_at >= cooked_at),
    calorie_intake_id INTEGER REFERENCES calorie_intake (id) ON DELETE SET NULL
);

CREATE INDEX idx_pantry_consumptions_person_cooked ON pantry_consumptions (person_id, cooked_at DESC);
CREATE INDEX idx_pantry_consumptions_recipe ON pantry_consumptions (recipe_id);
CREATE INDEX idx_pantry_consumptions_menu ON pantry_consumptions (menu_id);
CREATE INDEX idx_pantry_consumptions_calorie_intake ON pantry_consumptions (calorie_intake_id);

-- what each cooking took from which lot; purchase_id is deliberately not a foreign key: a lot used up
-- is deleted, and undo recreates it under the same id and purchase date
CREATE TABLE pantry_consumption_lots (
    consumption_id INTEGER NOT NULL REFERENCES pantry_consumptions (id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients (id) ON DELETE CASCADE,
    purchase_id INTEGER NOT NULL,
    quantity DOUBLE PRECISION NOT NULL CHECK (quantity > 0),
    lot_purchase_date TIMESTAMP,
    PRIMARY KEY (consumption_id, purchase_id)
);

CREATE INDEX idx_pantry_consumption_lots_ingredient ON pantry_consumption_lots (ingredient_id);

-- Down Migration

DROP TABLE IF EXISTS pantry_consumption_lots;
DROP TABLE IF EXISTS pantry_consumptions;
