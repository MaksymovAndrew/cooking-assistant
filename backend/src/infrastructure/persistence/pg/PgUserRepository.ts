import type { Pool } from "pg";

import { ERROR_MESSAGES } from "constants/errorMessages";
import { AppError } from "domain/errors/AppError";
import type {
    NewUser,
    PublicUser,
    UserRecord,
    UserRepository,
} from "domain/repositories/UserRepository";

interface PersonRow {
    id: number;
    name: string;
    surname: string;
    login: string;
    password: string;
}

function isUniqueViolation(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: unknown }).code === "23505"
    );
}

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
            `SELECT id, name, surname, login, created_at FROM person WHERE id = $1`,
            [id],
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async create({
        name,
        surname,
        login,
        password,
    }: NewUser): Promise<unknown> {
        try {
            const result = await this.pool.query<PersonRow>(
                `INSERT INTO person (name, surname, login, password) VALUES ($1, $2, $3, $4) RETURNING id, name, surname, login`,
                [name, surname, login, password],
            );

            return result.rows[0];
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new AppError(ERROR_MESSAGES.LOGIN_ALREADY_TAKEN, 409);
            }
            throw error;
        }
    }

    async findAll(): Promise<unknown[]> {
        const result = await this.pool.query<UserRecord>(
            `SELECT id, name, surname, login FROM person`,
        );

        return result.rows;
    }
}
