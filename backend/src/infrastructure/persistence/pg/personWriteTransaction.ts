import type { Pool, PoolClient } from "pg";

// the person row lock serializes one user's writes, so a per-user limit and the next position can't race;
// NO KEY UPDATE leaves foreign-key inserts into other person-owned tables unblocked
export async function inPersonWriteTransaction<T>(
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
