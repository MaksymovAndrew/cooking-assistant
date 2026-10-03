import type { PoolClient } from "pg";

import type { RecipeIngredient } from "domain/entities/Recipe";
import type { RecipeRow } from "domain/repositories/recipe.types";

import { computedRecipeCalories } from "./calorieColumns";

export async function insertRecipeIngredients(
    client: PoolClient,
    recipeId: number,
    ingredients: RecipeIngredient[],
): Promise<void> {
    await client.query(
        `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_recipe_ingredients)
         SELECT $1, item.ingredient_id, item.quantity
         FROM unnest($2::int[], $3::float8[]) AS item(ingredient_id, quantity)`,
        [
            recipeId,
            ingredients.map((ingredient) => ingredient.id),
            ingredients.map(
                (ingredient) => ingredient.quantity_recipe_ingredients,
            ),
        ],
    );
}

// denormalized for lists and filters; RETURNING here, after the recompute, keeps the row accurate
export async function recomputeRecipeCalories(
    client: PoolClient,
    recipeId: number,
): Promise<RecipeRow> {
    const result = await client.query<RecipeRow>(
        `UPDATE recipes SET calories_computed = ${computedRecipeCalories("$1")}
         WHERE id = $1
         RETURNING id, title, content, language, person_id, type_id, creation_date,
                   cooking_time, calories_override, calories_computed, photo_key`,
        [recipeId],
    );

    return result.rows[0];
}
