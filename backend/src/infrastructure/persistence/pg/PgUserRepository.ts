import type { Pool } from "pg";

import { ERROR_CODES, ERROR_MESSAGES } from "constants/errorMessages";
import { AppError } from "domain/errors/AppError";
import type {
    NewUser,
    PasswordResetCandidate,
    PublicUser,
    UserCredentials,
    UserRecord,
    UserRepository,
} from "domain/repositories/UserRepository";

const UNIQUE_LOGIN_CONSTRAINT = "unique_login";
const UNIQUE_EMAIL_CONSTRAINT = "unique_email";

// null when the error isn't a unique-violation at all; otherwise the constraint name Postgres reported
function getUniqueViolationConstraint(error: unknown): string | null {
    const isUniqueViolation =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: unknown }).code === "23505";

    if (!isUniqueViolation) {
        return null;
    }

    const { constraint } = error as { constraint?: unknown };

    return typeof constraint === "string" ? constraint : null;
}

// maps a unique-violation to the right domain error; null when the error isn't one we recognize (caller rethrows as-is)
function uniqueViolationError(error: unknown): AppError | null {
    const constraint = getUniqueViolationConstraint(error);

    if (constraint === UNIQUE_EMAIL_CONSTRAINT) {
        return new AppError(
            ERROR_MESSAGES.EMAIL_ALREADY_TAKEN,
            409,
            ERROR_CODES.EMAIL_ALREADY_TAKEN,
        );
    }

    if (constraint === UNIQUE_LOGIN_CONSTRAINT) {
        return new AppError(
            ERROR_MESSAGES.LOGIN_ALREADY_TAKEN,
            409,
            ERROR_CODES.LOGIN_ALREADY_TAKEN,
        );
    }

    return null;
}

const PUBLIC_USER_COLUMNS =
    "id, name, surname, login, created_at, email, email_verified_at";

export default class PgUserRepository implements UserRepository {
    constructor(private pool: Pool) {}

    async findByLogin(login: string): Promise<UserRecord | null> {
        const result = await this.pool.query<UserRecord>(
            `SELECT * FROM person WHERE login = $1`,
            [login],
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async findById(id: number): Promise<PublicUser | null> {
        const result = await this.pool.query<PublicUser>(
            `SELECT ${PUBLIC_USER_COLUMNS} FROM person WHERE id = $1`,
            [id],
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async findByEmail(email: string): Promise<PublicUser | null> {
        const result = await this.pool.query<PublicUser>(
            `SELECT ${PUBLIC_USER_COLUMNS} FROM person WHERE email = $1`,
            [email],
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async findCredentialsById(id: number): Promise<UserCredentials | null> {
        const result = await this.pool.query<UserCredentials>(
            `SELECT id, password FROM person WHERE id = $1`,
            [id],
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async findCredentialsByEmail(
        email: string,
    ): Promise<UserCredentials | null> {
        const result = await this.pool.query<UserCredentials>(
            `SELECT id, password FROM person WHERE email = $1`,
            [email],
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async findPasswordResetCandidateByEmail(
        email: string,
    ): Promise<PasswordResetCandidate | null> {
        const result = await this.pool.query<PasswordResetCandidate>(
            `SELECT id, password, email_verified_at FROM person WHERE email = $1`,
            [email],
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async create({
        name,
        surname,
        login,
        password,
        email,
    }: NewUser): Promise<{ id: number }> {
        try {
            const result = await this.pool.query<{ id: number }>(
                `INSERT INTO person (name, surname, login, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [name, surname, login, password, email],
            );

            return result.rows[0];
        } catch (error) {
            throw uniqueViolationError(error) ?? error;
        }
    }

    async findAll(): Promise<unknown[]> {
        const result = await this.pool.query<UserRecord>(
            `SELECT id, name, surname, login FROM person`,
        );

        return result.rows;
    }

    async updatePassword(id: number, hashedPassword: string): Promise<void> {
        await this.pool.query(`UPDATE person SET password = $1 WHERE id = $2`, [
            hashedPassword,
            id,
        ]);
    }

    async markEmailVerified(id: number): Promise<void> {
        await this.pool.query(
            `UPDATE person SET email_verified_at = now() WHERE id = $1`,
            [id],
        );
    }
}
