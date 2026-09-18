-- Up Migration

-- allergen slugs are a closed list validated by the API, so a plain text column is enough - no lookup table
CREATE TABLE person_avoided_allergens (
    person_id INTEGER NOT NULL REFERENCES person (id) ON DELETE CASCADE,
    allergen TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (person_id, allergen)
);

CREATE TABLE person_avoided_ingredients (
    person_id INTEGER NOT NULL REFERENCES person (id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (person_id, ingredient_id)
);

CREATE INDEX idx_person_avoided_ingredients_ingredient ON person_avoided_ingredients (ingredient_id);

-- Down Migration

DROP TABLE IF EXISTS person_avoided_ingredients;

DROP TABLE IF EXISTS person_avoided_allergens;
