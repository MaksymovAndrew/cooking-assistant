import type { Pool, PoolClient } from "pg";

import type { Recipe } from "domain/entities/Recipe";

interface RecipeRow {
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

// keeps calories_computed in sync with the ingredients just written, so lists/filters can read
// it as a plain column instead of aggregating recipe_ingredients on every query; RETURNING * here
// (not on the earlier INSERT/UPDATE) is what makes the row handed back to the caller accurate
async function recomputeRecipeCalories(
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

export async function createRecipeInDb(
    pool: Pool,
    {
        title,
        content,
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
            `INSERT INTO recipes (title, content, person_id, type_id, cooking_time, calories_override)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                title,
                content,
                person_id,
                type_id,
                cooking_time,
                calories_override,
            ],
        );

        const recipeId = newRecipe.rows[0].id;

        for (const { id, quantity_recipe_ingredients } of ingredients) {
            await client.query(
                `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_recipe_ingredients)
             VALUES ($1, $2, $3)`,
                [recipeId, id, quantity_recipe_ingredients],
            );
        }

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
            `UPDATE recipes SET title = $1, content = $2, type_id = $3, cooking_time = $4, calories_override = $5
         WHERE id = $6 AND person_id = $7 RETURNING *`,
            [
                title,
                content,
                type_id,
                cooking_time,
                calories_override,
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

        for (const { id, quantity_recipe_ingredients } of newIngredients) {
            await client.query(
                `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_recipe_ingredients)
             VALUES ($1, $2, $3)`,
                [recipeId, id, quantity_recipe_ingredients],
            );
        }

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
