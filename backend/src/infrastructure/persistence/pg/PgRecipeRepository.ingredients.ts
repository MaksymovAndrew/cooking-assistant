import type { PoolClient } from "pg";

import type { RecipeIngredient } from "domain/entities/Recipe";

export interface RecipeRow {
    id: number;
    title: string;
    content: string;
    person_id: number;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    calories_override: number | null;
    calories_computed: number | null;
}

export async function insertRecipeIngredients(
    client: PoolClient,
    recipeId: string | number,
    ingredients: RecipeIngredient[],
): Promise<void> {
    for (const { id, quantity_recipe_ingredients } of ingredients) {
        await client.query(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_recipe_ingredients)
             VALUES ($1, $2, $3)`,
            [recipeId, id, quantity_recipe_ingredients],
        );
    }
}

// keeps calories_computed in sync with the ingredients just written, so lists/filters can read
// it as a plain column instead of aggregating recipe_ingredients on every query; RETURNING * here
// (not on the earlier INSERT/UPDATE) is what makes the row handed back to the caller accurate
export async function recomputeRecipeCalories(
    client: PoolClient,
    recipeId: number,
): Promise<RecipeRow> {
    const result = await client.query<RecipeRow>(
        `UPDATE recipes SET calories_computed = (
             SELECT SUM(ri.quantity_recipe_ingredients * i.calories_per_unit)
             FROM recipe_ingredients ri
                      JOIN ingredients i ON i.id = ri.ingredient_id
             WHERE ri.recipe_id = $1
         ) WHERE id = $1 RETURNING *`,
        [recipeId],
    );

    return result.rows[0];
}
