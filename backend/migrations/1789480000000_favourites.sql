-- Up Migration

-- one table per target instead of a polymorphic (type, id) pair, so every row keeps real foreign keys;
-- all of them CASCADE because recipe, menu and account deletion are hand-written transactions that know
-- nothing about favourites
CREATE TABLE recipe_favourites (
    person_id INTEGER NOT NULL REFERENCES person (id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (person_id, recipe_id)
);

CREATE INDEX idx_recipe_favourites_recipe ON recipe_favourites (recipe_id);

CREATE TABLE menu_favourites (
    person_id INTEGER NOT NULL REFERENCES person (id) ON DELETE CASCADE,
    menu_id INTEGER NOT NULL REFERENCES menu (menu_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (person_id, menu_id)
);

CREATE INDEX idx_menu_favourites_menu ON menu_favourites (menu_id);

-- Down Migration

DROP TABLE IF EXISTS menu_favourites;

DROP TABLE IF EXISTS recipe_favourites;
