-- Up Migration

-- the primary key is the one-vote-per-person rule: changing a rating updates that row, never adds one;
-- every foreign key CASCADEs because recipe, menu and account deletion are hand-written transactions
-- that know nothing about ratings
CREATE TABLE recipe_ratings (
    person_id INTEGER NOT NULL REFERENCES person (id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
    value SMALLINT NOT NULL CHECK (value BETWEEN 1 AND 5),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (person_id, recipe_id)
);

CREATE INDEX idx_recipe_ratings_recipe ON recipe_ratings (recipe_id);

CREATE TABLE menu_ratings (
    person_id INTEGER NOT NULL REFERENCES person (id) ON DELETE CASCADE,
    menu_id INTEGER NOT NULL REFERENCES menu (menu_id) ON DELETE CASCADE,
    value SMALLINT NOT NULL CHECK (value BETWEEN 1 AND 5),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (person_id, menu_id)
);

CREATE INDEX idx_menu_ratings_menu ON menu_ratings (menu_id);

-- running totals, so a list reads the average for free; the average itself is never stored
ALTER TABLE recipes
    ADD COLUMN rating_sum INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN rating_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE menu
    ADD COLUMN rating_sum INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN rating_count INTEGER NOT NULL DEFAULT 0;

-- the totals follow every vote row by a relative delta, in the same transaction. A trigger rather than
-- repository code because a deleted account takes its votes with it through a cascade, and the totals
-- of everything it rated must come down too. Relative arithmetic under the row lock is what keeps two
-- simultaneous votes from overwriting each other.
CREATE FUNCTION recipe_ratings_totals() RETURNS trigger AS $$
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        UPDATE recipes SET rating_sum = rating_sum - OLD.value, rating_count = rating_count - 1
        WHERE id = OLD.recipe_id;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        UPDATE recipes SET rating_sum = rating_sum + NEW.value, rating_count = rating_count + 1
        WHERE id = NEW.recipe_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipe_ratings_totals
    AFTER INSERT OR UPDATE OF value OR DELETE ON recipe_ratings
    FOR EACH ROW EXECUTE FUNCTION recipe_ratings_totals();

CREATE FUNCTION menu_ratings_totals() RETURNS trigger AS $$
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        UPDATE menu SET rating_sum = rating_sum - OLD.value, rating_count = rating_count - 1
        WHERE menu_id = OLD.menu_id;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        UPDATE menu SET rating_sum = rating_sum + NEW.value, rating_count = rating_count + 1
        WHERE menu_id = NEW.menu_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER menu_ratings_totals
    AFTER INSERT OR UPDATE OF value OR DELETE ON menu_ratings
    FOR EACH ROW EXECUTE FUNCTION menu_ratings_totals();

-- Down Migration

DROP TRIGGER IF EXISTS menu_ratings_totals ON menu_ratings;

DROP FUNCTION IF EXISTS menu_ratings_totals();

DROP TRIGGER IF EXISTS recipe_ratings_totals ON recipe_ratings;

DROP FUNCTION IF EXISTS recipe_ratings_totals();

ALTER TABLE menu DROP COLUMN IF EXISTS rating_count, DROP COLUMN IF EXISTS rating_sum;

ALTER TABLE recipes DROP COLUMN IF EXISTS rating_count, DROP COLUMN IF EXISTS rating_sum;

DROP TABLE IF EXISTS menu_ratings;

DROP TABLE IF EXISTS recipe_ratings;
