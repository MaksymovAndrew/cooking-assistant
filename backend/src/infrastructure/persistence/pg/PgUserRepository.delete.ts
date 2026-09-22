import type { Pool } from "pg";

// transactional cascade-by-hand: menu.person_id and menu_recipe.recipe_id have no ON DELETE
// CASCADE, so clear them before deleting the person (recipes/pantry/purchases cascade cleanly)
export async function deleteUser(pool: Pool, id: number): Promise<void> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `DELETE FROM menu_recipe WHERE recipe_id IN (SELECT id FROM recipes WHERE person_id = $1)`,
            [id],
        );
        await client.query(`DELETE FROM menu WHERE person_id = $1`, [id]);
        await client.query(`DELETE FROM person WHERE id = $1`, [id]);

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
