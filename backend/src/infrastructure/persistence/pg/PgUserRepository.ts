import type { Pool, QueryResultRow } from "pg";

import type { Locale } from "constants/locales";
import type {
    NewUser,
    PasswordResetCandidate,
    ProfileUpdate,
    PublicUser,
    UserCredentials,
    UserRecord,
    UserRepository,
} from "domain/repositories/UserRepository";

import { createUser } from "./PgUserRepository.create";
import { deleteUser } from "./PgUserRepository.delete";

const PUBLIC_USER_COLUMNS =
    "id, name, surname, login, created_at, email, email_verified_at, avatar, " +
    "avatar_photo_key, calorie_goal, locale";

export default class PgUserRepository implements UserRepository {
    constructor(private pool: Pool) {}

    private async firstRow<T extends QueryResultRow>(
        sql: string,
        params: unknown[],
    ): Promise<T | null> {
        const result = await this.pool.query<T>(sql, params);

        return result.rows[0] ?? null;
    }

    async findByLogin(login: string): Promise<UserRecord | null> {
        return this.firstRow<UserRecord>(
            `SELECT * FROM person WHERE login = $1`,
            [login],
        );
    }

    async findById(id: number): Promise<PublicUser | null> {
        return this.firstRow<PublicUser>(
            `SELECT ${PUBLIC_USER_COLUMNS} FROM person WHERE id = $1`,
            [id],
        );
    }

    async findByEmail(email: string): Promise<PublicUser | null> {
        return this.firstRow<PublicUser>(
            `SELECT ${PUBLIC_USER_COLUMNS} FROM person WHERE email = $1`,
            [email],
        );
    }

    async findCredentialsById(id: number): Promise<UserCredentials | null> {
        return this.firstRow<UserCredentials>(
            `SELECT id, password, session_version FROM person WHERE id = $1`,
            [id],
        );
    }

    async findCredentialsByEmail(
        email: string,
    ): Promise<UserCredentials | null> {
        return this.firstRow<UserCredentials>(
            `SELECT id, password, session_version FROM person WHERE email = $1`,
            [email],
        );
    }

    async findPasswordResetCandidateByEmail(
        email: string,
    ): Promise<PasswordResetCandidate | null> {
        return this.firstRow<PasswordResetCandidate>(
            `SELECT id, password, email_verified_at, locale FROM person WHERE email = $1`,
            [email],
        );
    }

    create(newUser: NewUser): Promise<{ id: number; session_version: number }> {
        return createUser(this.pool, newUser);
    }

    async updatePassword(
        id: number,
        hashedPassword: string,
    ): Promise<number | null> {
        const row = await this.firstRow<{ session_version: number }>(
            `UPDATE person SET password = $1, session_version = session_version + 1
             WHERE id = $2 RETURNING session_version`,
            [hashedPassword, id],
        );

        return row?.session_version ?? null;
    }

    async findSessionVersion(id: number): Promise<number | null> {
        const row = await this.firstRow<{ session_version: number }>(
            `SELECT session_version FROM person WHERE id = $1`,
            [id],
        );

        return row?.session_version ?? null;
    }

    async updateProfile(
        id: number,
        { name, surname, avatar }: ProfileUpdate,
    ): Promise<void> {
        await this.pool.query(
            `UPDATE person SET name = $1, surname = $2, avatar = $3 WHERE id = $4`,
            [name, surname, avatar, id],
        );
    }

    async updateLocale(id: number, locale: Locale): Promise<void> {
        await this.pool.query(`UPDATE person SET locale = $1 WHERE id = $2`, [
            locale,
            id,
        ]);
    }

    async markEmailVerified(id: number): Promise<void> {
        await this.pool.query(
            `UPDATE person SET email_verified_at = now() WHERE id = $1`,
            [id],
        );
    }

    async delete(id: number): Promise<string[]> {
        return deleteUser(this.pool, id);
    }
}
