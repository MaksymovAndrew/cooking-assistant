import type { Pool, PoolClient } from "pg";

export interface TransactionOutcome<T> {
    commit: boolean;
    result: T;
}

// work decides whether to commit, so an expected miss rolls back without a throw
export async function withTransaction<T>(
    pool: Pool,
    work: (client: PoolClient) => Promise<TransactionOutcome<T>>,
): Promise<T> {
    const client = await pool.connect();
    let destroyClient = false;

    try {
        await client.query("BEGIN");
        const { commit, result } = await work(client);

        await client.query(commit ? "COMMIT" : "ROLLBACK");

        return result;
    } catch (error) {
        // a failed ROLLBACK means a dead connection: drop it and keep the original error
        await client.query("ROLLBACK").catch(() => {
            destroyClient = true;
        });
        throw error;
    } finally {
        client.release(destroyClient);
    }
}

export function committed<T>(result: T): TransactionOutcome<T> {
    return { commit: true, result };
}

export function rolledBack<T>(result: T): TransactionOutcome<T> {
    return { commit: false, result };
}
