import type { Pool } from "pg";

import type { Recipe } from "domain/entities/Recipe";
import type { RecipeRow } from "domain/repositories/recipe.types";

import {
    insertRecipeIngredients,
    recomputeRecipeCalories,
} from "./PgRecipeRepository.ingredients";
import { committed, rolledBack, withTransaction } from "./transaction";

export function createRecipeInDb(
    pool: Pool,
    {
        title,
        content,
        language,
        person_id,
        ingredients,
        type_id,
        cooking_time,
        calories_override,
    }: Recipe,
): Promise<RecipeRow> {
    return withTransaction(pool, async (client) => {
        const newRecipe = await client.query<{ id: number }>(
            `INSERT INTO recipes (title, content, person_id, type_id, cooking_time, calories_override, language)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [
                title,
                content,
                person_id,
                type_id,
                cooking_time,
                calories_override,
                language,
            ],
        );
        const recipeId = newRecipe.rows[0].id;

        await insertRecipeIngredients(client, recipeId, ingredients);

        return committed(await recomputeRecipeCalories(client, recipeId));
    });
}

export function updateRecipeInDb(
    pool: Pool,
    recipeId: number,
    personId: number,
    {
        title,
        content,
        language,
        ingredients: newIngredients,
        type_id,
        cooking_time,
        calories_override,
    }: Recipe,
): Promise<RecipeRow | null> {
    return withTransaction(pool, async (client) => {
        const result = await client.query(
            `UPDATE recipes SET title = $1, content = $2, type_id = $3, cooking_time = $4, calories_override = $5, language = $6
         WHERE id = $7 AND person_id = $8`,
            [
                title,
                content,
                type_id,
                cooking_time,
                calories_override,
                language,
                recipeId,
                personId,
            ],
        );

        if (result.rowCount === 0) {
            return rolledBack(null);
        }

        await client.query(
            `DELETE FROM recipe_ingredients WHERE recipe_id = $1`,
            [recipeId],
        );
        await insertRecipeIngredients(client, recipeId, newIngredients);

        return committed(await recomputeRecipeCalories(client, recipeId));
    });
}
