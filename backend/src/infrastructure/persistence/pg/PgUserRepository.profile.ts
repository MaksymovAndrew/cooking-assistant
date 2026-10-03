import type { Pool } from "pg";

import type { Locale } from "constants/locales";
import type { ProfileUpdate } from "domain/repositories/UserRepository";

export async function updateProfile(
    pool: Pool,
    id: number,
    { name, surname, avatar }: ProfileUpdate,
): Promise<void> {
    await pool.query(
        `UPDATE person SET name = $1, surname = $2, avatar = $3 WHERE id = $4`,
        [name, surname, avatar, id],
    );
}

export async function updateLocale(
    pool: Pool,
    id: number,
    locale: Locale,
): Promise<void> {
    await pool.query(`UPDATE person SET locale = $1 WHERE id = $2`, [
        locale,
        id,
    ]);
}

export async function markEmailVerified(pool: Pool, id: number): Promise<void> {
    await pool.query(
        `UPDATE person SET email_verified_at = now() WHERE id = $1`,
        [id],
    );
}
