import type { Pool } from "pg";

import type { DeletedRecord } from "domain/repositories/PhotoRepository";

// the photo key comes back from the delete itself, under the row lock: read in a separate query,
// an upload landing in between would leave its files on disk with no row naming them
export async function deleteRecipeById(
    pool: Pool,
    recipeId: string | number,
    personId: number,
): Promise<DeletedRecord | null> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const owned = await client.query(
            `SELECT id FROM recipes WHERE id = $1 AND person_id = $2 FOR UPDATE`,
            [recipeId, personId],
        );

        if (owned.rowCount === 0) {
            await client.query("ROLLBACK");

            return null;
        }

        await client.query(`DELETE FROM menu_recipe WHERE recipe_id = $1`, [
            recipeId,
        ]);

        await client.query(
            `DELETE FROM recipe_ingredients WHERE recipe_id = $1`,
            [recipeId],
        );

        const result = await client.query<{ photo_key: string | null }>(
            `DELETE FROM recipes WHERE id = $1 RETURNING photo_key`,
            [recipeId],
        );

        await client.query("COMMIT");

        return { photoKey: result.rows[0].photo_key };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
