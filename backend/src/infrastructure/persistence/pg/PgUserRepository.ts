import type { Pool } from "pg";

import type {
    NewUser,
    PasswordResetCandidate,
    ProfileUpdate,
    PublicUser,
    UserCredentials,
    UserRecord,
    UserRepository,
} from "domain/repositories/UserRepository";

import { uniqueViolationError } from "./PgUserRepository.errors";

const PUBLIC_USER_COLUMNS =
    "id, name, surname, login, created_at, email, email_verified_at, avatar, " +
    "calorie_goal, calorie_goal_period, meal_calorie_limit";

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

    async updatePassword(id: number, hashedPassword: string): Promise<void> {
        await this.pool.query(`UPDATE person SET password = $1 WHERE id = $2`, [
            hashedPassword,
            id,
        ]);
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

    async markEmailVerified(id: number): Promise<void> {
        await this.pool.query(
            `UPDATE person SET email_verified_at = now() WHERE id = $1`,
            [id],
        );
    }

    // transactional cascade-by-hand: menu.person_id and menu_recipe.recipe_id have no ON DELETE
    // CASCADE, so clear them before deleting the person (recipes/pantry/purchases cascade cleanly)
    async delete(id: number): Promise<void> {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");

            await client.query(
                `DELETE FROM menu_recipe WHERE recipe_id IN (SELECT id FROM recipes WHERE person_id = $1)`,
                [id],
            );
            await client.query(`DELETE FROM menu WHERE person_id = $1`, [id]);
            await client.query(`DELETE FROM person WHERE id = $1`, [id]);

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}
