import type { Pool, QueryResultRow } from "pg";

export async function firstRow<T extends QueryResultRow>(
    pool: Pool,
    sql: string,
    params: unknown[],
): Promise<T | null> {
    const result = await pool.query<T>(sql, params);

    return result.rows[0] ?? null;
}
