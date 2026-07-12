import type { Pool } from "pg";

export async function deleteMenuById(
    pool: Pool,
    id: string | number,
    personId: number,
): Promise<boolean> {
    // explicit delete: legacy database.sql adopters carry a second menu_id FK without CASCADE
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const owned = await client.query(
            "SELECT menu_id FROM menu WHERE menu_id = $1 AND person_id = $2 FOR UPDATE",
            [id, personId],
        );

        if (owned.rowCount === 0) {
            await client.query("ROLLBACK");

            return false;
        }

        await client.query("DELETE FROM menu_recipe WHERE menu_id = $1", [id]);
        await client.query("DELETE FROM menu WHERE menu_id = $1", [id]);

        await client.query("COMMIT");

        return true;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
