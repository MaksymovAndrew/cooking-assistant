import type { Pool, PoolClient } from "pg";

async function deletedKeys(
    client: PoolClient,
    sql: string,
    id: number,
): Promise<string[]> {
    const result = await client.query<{ key: string | null }>(sql, [id]);

    return result.rows.flatMap((row) => (row.key ? [row.key] : []));
}

// transactional cascade-by-hand: menu.person_id and menu_recipe.recipe_id have no ON DELETE
// CASCADE, so clear them before deleting the person (recipes/pantry/purchases cascade cleanly);
// each delete returns the photo keys its rows held, so the files can go once the transaction commits
export async function deleteUser(pool: Pool, id: number): Promise<string[]> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `DELETE FROM menu_recipe WHERE recipe_id IN (SELECT id FROM recipes WHERE person_id = $1)`,
            [id],
        );
        const menuKeys = await deletedKeys(
            client,
            `DELETE FROM menu WHERE person_id = $1 RETURNING photo_key AS key`,
            id,
        );
        const recipeKeys = await deletedKeys(
            client,
            `DELETE FROM recipes WHERE person_id = $1 RETURNING photo_key AS key`,
            id,
        );
        const avatarKeys = await deletedKeys(
            client,
            `DELETE FROM person WHERE id = $1 RETURNING avatar_photo_key AS key`,
            id,
        );

        await client.query("COMMIT");

        return [...menuKeys, ...recipeKeys, ...avatarKeys];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
