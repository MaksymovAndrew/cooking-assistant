import type { Pool } from "pg";

import type { NewUser } from "domain/repositories/UserRepository";

import { uniqueViolationError } from "./PgUserRepository.errors";

// a taken login or email surfaces as its own 409 code, decided by the constraint Postgres reports
export async function createUser(
    pool: Pool,
    { name, surname, login, password, email, locale }: NewUser,
): Promise<{ id: number; session_version: number }> {
    try {
        const result = await pool.query<{
            id: number;
            session_version: number;
        }>(
            `INSERT INTO person (name, surname, login, password, email, locale) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, session_version`,
            [name, surname, login, password, email, locale],
        );

        return result.rows[0];
    } catch (error) {
        throw uniqueViolationError(error) ?? error;
    }
}
