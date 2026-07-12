import type { Pool } from "pg";

import { ERROR_MESSAGES } from "constants/errorMessages";
import { AppError } from "domain/errors/AppError";

import PgUserRepository from "infrastructure/persistence/pg/PgUserRepository";

import { catchError } from "test/helpers/assertions";

import { unique } from "./fixtures";
import { createTestPool } from "./testPool";

interface PublicUserRow {
    id: number;
    name: string;
    surname: string;
    login: string;
    password?: unknown;
}

const PASSWORD = "hashed-password";

describe("PgUserRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgUserRepository;

    beforeAll(() => {
        pool = createTestPool();
        repository = new PgUserRepository(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    it("should create a user and return only its public fields", async () => {
        const login = unique("newuser");
        const created = (await repository.create({
            name: "Ada",
            surname: "Lovelace",
            login,
            password: PASSWORD,
        })) as PublicUserRow;

        expect(created).toEqual(
            expect.objectContaining({
                name: "Ada",
                surname: "Lovelace",
                login,
            }),
        );
        expect(created).not.toHaveProperty("password");
    });

    it("should reject a duplicate login with a 409", async () => {
        const login = unique("dupe");

        await repository.create({
            name: "First",
            surname: "User",
            login,
            password: PASSWORD,
        });

        const error = await catchError(
            repository.create({
                name: "Second",
                surname: "User",
                login,
                password: PASSWORD,
            }),
        );

        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).status).toBe(409);
        expect((error as AppError).message).toBe(
            ERROR_MESSAGES.LOGIN_ALREADY_TAKEN,
        );
    });

    it("should find the full record by login including the password hash", async () => {
        const login = unique("findlogin");

        await repository.create({
            name: "Grace",
            surname: "Hopper",
            login,
            password: PASSWORD,
        });

        const found = await repository.findByLogin(login);

        expect(found).toEqual(
            expect.objectContaining({
                login,
                password: PASSWORD,
            }),
        );
    });

    it("should return null for an unknown login", async () => {
        const found = await repository.findByLogin(unique("no-such-login"));

        expect(found).toBeNull();
    });

    it("should return only public fields by id, and null for an unknown id", async () => {
        const login = unique("findbyid");
        const created = (await repository.create({
            name: "Alan",
            surname: "Turing",
            login,
            password: PASSWORD,
        })) as { id: number };

        const found = await repository.findById(created.id);

        expect(found).toEqual(
            expect.objectContaining({ id: created.id, name: "Alan", login }),
        );
        expect(found).not.toHaveProperty("password");
        expect(new Date(found?.created_at ?? "").getTime()).not.toBeNaN();

        const missing = await repository.findById(created.id + 1_000_000);

        expect(missing).toBeNull();
    });

    it("should list users without exposing passwords", async () => {
        const login = unique("listed");

        await repository.create({
            name: "Katherine",
            surname: "Johnson",
            login,
            password: PASSWORD,
        });

        const all = (await repository.findAll()) as PublicUserRow[];
        const match = all.find((row) => row.login === login);

        expect(match).toEqual(expect.objectContaining({ login }));
        all.forEach((row) => {
            expect(row).not.toHaveProperty("password");
        });
    });
});
