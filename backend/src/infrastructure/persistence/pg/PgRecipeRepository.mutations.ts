import type { Pool } from "pg";

import type { Recipe } from "domain/entities/Recipe";

import {
    insertRecipeIngredients,
    type RecipeRow,
    recomputeRecipeCalories,
} from "./PgRecipeRepository.ingredients";

export async function createRecipeInDb(
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
): Promise<unknown> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const newRecipe = await client.query<RecipeRow>(
            `INSERT INTO recipes (title, content, person_id, type_id, cooking_time, calories_override, language)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
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

        const finalRecipe = await recomputeRecipeCalories(client, recipeId);

        await client.query("COMMIT");

        return finalRecipe;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function updateRecipeInDb(
    pool: Pool,
    recipeId: string | number,
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
): Promise<unknown> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query<RecipeRow>(
            `UPDATE recipes SET title = $1, content = $2, type_id = $3, cooking_time = $4, calories_override = $5, language = $6
         WHERE id = $7 AND person_id = $8 RETURNING *`,
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
            await client.query("ROLLBACK");

            return null;
        }

        await client.query(
            `DELETE FROM recipe_ingredients WHERE recipe_id = $1`,
            [recipeId],
        );

        await insertRecipeIngredients(client, recipeId, newIngredients);

        const finalRecipe = await recomputeRecipeCalories(
            client,
            Number(recipeId),
        );

        await client.query("COMMIT");

        return finalRecipe;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
