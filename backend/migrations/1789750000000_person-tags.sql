-- Up Migration

CREATE TABLE person_tags (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES person (id) ON DELETE CASCADE,
    name VARCHAR(40) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- one name per person regardless of case, so "Quick" and "quick" can't both exist
CREATE UNIQUE INDEX idx_person_tags_person_name ON person_tags (person_id, lower(name));

CREATE TABLE recipe_tag_links (
    tag_id INTEGER NOT NULL REFERENCES person_tags (id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tag_id, recipe_id)
);

CREATE INDEX idx_recipe_tag_links_recipe ON recipe_tag_links (recipe_id);

-- Down Migration

DROP TABLE IF EXISTS recipe_tag_links;

DROP TABLE IF EXISTS person_tags;
