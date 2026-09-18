import type { Pool } from "pg";

import type { AllergenSlug } from "constants/allergens";
import type {
    AvoidIngredientOutcome,
    DietPreferences,
    DietPreferencesRepository,
} from "domain/repositories/DietPreferencesRepository";

export default class PgDietPreferencesRepository implements DietPreferencesRepository {
    constructor(private pool: Pool) {}

    async findByPerson(personId: number): Promise<DietPreferences> {
        const result = await this.pool.query<DietPreferences>(
            `SELECT
                 ARRAY(SELECT allergen FROM person_avoided_allergens
                       WHERE person_id = $1 ORDER BY created_at, allergen) AS allergens,
                 ARRAY(SELECT ingredient_id FROM person_avoided_ingredients
                       WHERE person_id = $1 ORDER BY created_at, ingredient_id) AS ingredient_ids`,
            [personId],
        );

        return result.rows[0];
    }

    // one statement, so the existence check and the insert share a snapshot; a repeat add is a no-op
    async addAllergen(
        personId: number,
        allergen: AllergenSlug,
    ): Promise<boolean> {
        const result = await this.pool.query<{ person_found: boolean }>(
            `WITH owner AS (
                 SELECT id FROM person WHERE id = $1
             ),
             inserted AS (
                 INSERT INTO person_avoided_allergens (person_id, allergen)
                 SELECT id, $2 FROM owner
                 ON CONFLICT DO NOTHING
             )
             SELECT EXISTS (SELECT 1 FROM owner) AS person_found`,
            [personId, allergen],
        );

        return result.rows[0].person_found;
    }

    async removeAllergen(
        personId: number,
        allergen: AllergenSlug,
    ): Promise<void> {
        await this.pool.query(
            `DELETE FROM person_avoided_allergens WHERE person_id = $1 AND allergen = $2`,
            [personId, allergen],
        );
    }

    async addIngredient(
        personId: number,
        ingredientId: number,
    ): Promise<AvoidIngredientOutcome> {
        const result = await this.pool.query<{
            person_found: boolean;
            ingredient_found: boolean;
        }>(
            `WITH owner AS (
                 SELECT id FROM person WHERE id = $1
             ),
             target AS (
                 SELECT id FROM ingredients WHERE id = $2
             ),
             inserted AS (
                 INSERT INTO person_avoided_ingredients (person_id, ingredient_id)
                 SELECT owner.id, target.id FROM owner, target
                 ON CONFLICT DO NOTHING
             )
             SELECT EXISTS (SELECT 1 FROM owner) AS person_found,
                    EXISTS (SELECT 1 FROM target) AS ingredient_found`,
            [personId, ingredientId],
        );
        const { person_found, ingredient_found } = result.rows[0];

        if (!person_found) {
            return "person_not_found";
        }

        return ingredient_found ? "added" : "ingredient_not_found";
    }

    async removeIngredient(
        personId: number,
        ingredientId: number,
    ): Promise<void> {
        await this.pool.query(
            `DELETE FROM person_avoided_ingredients WHERE person_id = $1 AND ingredient_id = $2`,
            [personId, ingredientId],
        );
    }
}
