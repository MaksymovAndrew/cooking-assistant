import type { PoolClient } from "pg";

interface ListTotals {
    total: number;
    last_position: number;
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
