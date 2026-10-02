import type { Pool } from "pg";

import { firstRow } from "./firstRow";

interface SessionVersionRow {
    session_version: number;
}

// each answers the new session version, or null when the person is gone
async function sessionVersion(
    pool: Pool,
    sql: string,
    params: unknown[],
): Promise<number | null> {
    const row = await firstRow<SessionVersionRow>(pool, sql, params);

    return row?.session_version ?? null;
}

// a new password ends every session sealed under the old version
export function updatePassword(
    pool: Pool,
    id: number,
    hashedPassword: string,
): Promise<number | null> {
    return sessionVersion(
        pool,
        `UPDATE person SET password = $1, session_version = session_version + 1
         WHERE id = $2 RETURNING session_version`,
        [hashedPassword, id],
    );
}

export function revokeSessions(pool: Pool, id: number): Promise<number | null> {
    return sessionVersion(
        pool,
        `UPDATE person SET session_version = session_version + 1
         WHERE id = $1 RETURNING session_version`,
        [id],
    );
}

export function findSessionVersion(
    pool: Pool,
    id: number,
): Promise<number | null> {
    return sessionVersion(
        pool,
        `SELECT session_version FROM person WHERE id = $1`,
        [id],
    );
}
