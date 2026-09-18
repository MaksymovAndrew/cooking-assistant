-- Up Migration

-- ingredient_id is optional: free-text items have none, and a catalog item survives its ingredient being
-- removed as plain text, which is why that key is SET NULL rather than CASCADE
CREATE TABLE shopping_list_items (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES person (id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    note VARCHAR(120),
    ingredient_id INTEGER REFERENCES ingredients (id) ON DELETE SET NULL,
    quantity DOUBLE PRECISION CHECK (quantity > 0),
    checked BOOLEAN NOT NULL DEFAULT false,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shopping_list_items_person ON shopping_list_items (person_id, position);

CREATE INDEX idx_shopping_list_items_ingredient ON shopping_list_items (ingredient_id);

-- Down Migration

DROP TABLE IF EXISTS shopping_list_items;
