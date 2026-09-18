import type { Pool, PoolClient } from "pg";

interface ListTotals {
    total: number;
    last_position: number;
}

// the person row lock serializes one user's list writes, so the size limit and the next position can't race;
// NO KEY UPDATE leaves foreign-key inserts into other person-owned tables unblocked
export async function inPersonListTransaction<T>(
    pool: Pool,
    personId: number,
    // returned when the person no longer exists, instead of letting an insert fail on the foreign key
    missingPerson: T,
    work: (client: PoolClient) => Promise<{ commit: boolean; result: T }>,
): Promise<T> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const locked = await client.query(
            `SELECT 1 FROM person WHERE id = $1 FOR NO KEY UPDATE`,
            [personId],
        );

        if (locked.rowCount === 0) {
            await client.query("ROLLBACK");

            return missingPerson;
        }

        const { commit, result } = await work(client);

        await client.query(commit ? "COMMIT" : "ROLLBACK");

        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function readTotals(
    client: PoolClient,
    personId: number,
): Promise<ListTotals> {
    const result = await client.query<ListTotals>(
        `SELECT COUNT(*)::int AS total, COALESCE(MAX(position), -1)::int AS last_position
         FROM shopping_list_items WHERE person_id = $1`,
        [personId],
    );

    return result.rows[0];
}
