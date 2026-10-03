import type { Pool, PoolClient } from "pg";

import {
    rolledBack,
    type TransactionOutcome,
    withTransaction,
} from "./transaction";

// serializes a user's writes so limits can't race; NO KEY UPDATE leaves FK inserts unblocked
export function inPersonWriteTransaction<T>(
    pool: Pool,
    personId: number,
    // returned instead of letting an insert fail on the foreign key
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
