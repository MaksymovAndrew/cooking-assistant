import type { Pool, PoolClient } from "pg";

import {
    rolledBack,
    type TransactionOutcome,
    withTransaction,
} from "./transaction";

// the person row lock serializes one user's writes, so a per-user limit and the next position can't race;
// NO KEY UPDATE leaves foreign-key inserts into other person-owned tables unblocked
export function inPersonWriteTransaction<T>(
    pool: Pool,
    personId: number,
    // returned when the person no longer exists, instead of letting an insert fail on the foreign key
    missingPerson: T,
    work: (client: PoolClient) => Promise<TransactionOutcome<T>>,
): Promise<T> {
    return withTransaction(pool, async (client) => {
        const locked = await client.query(
            `SELECT 1 FROM person WHERE id = $1 FOR NO KEY UPDATE`,
            [personId],
        );

        if (locked.rowCount === 0) {
            return rolledBack(missingPerson);
        }

        return work(client);
    });
}
