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
const uniqueEmail = (prefix: string) => `${unique(prefix)}@example.com`;

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

    it("should create a user and return its new id", async () => {
        const created = await repository.create({
            name: "Ada",
            surname: "Lovelace",
            login: unique("newuser"),
            password: PASSWORD,
            email: uniqueEmail("ada"),
        });

        expect(typeof created.id).toBe("number");
    });

    it("should reject a duplicate login with a 409", async () => {
        const login = unique("dupe");

        await repository.create({
            name: "First",
            surname: "User",
            login,
            password: PASSWORD,
            email: uniqueEmail("first"),
        });

        const error = await catchError(
            repository.create({
                name: "Second",
                surname: "User",
                login,
                password: PASSWORD,
                email: uniqueEmail("second"),
            }),
        );

        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).status).toBe(409);
        expect((error as AppError).message).toBe(
            ERROR_MESSAGES.LOGIN_ALREADY_TAKEN,
        );
    });

    it("should reject a duplicate email with a 409", async () => {
        const email = uniqueEmail("dupe");

        await repository.create({
            name: "First",
            surname: "User",
            login: unique("emailowner"),
            password: PASSWORD,
            email,
        });

        const error = await catchError(
            repository.create({
                name: "Second",
                surname: "User",
                login: unique("emailthief"),
                password: PASSWORD,
                email,
            }),
        );

        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).status).toBe(409);
        expect((error as AppError).message).toBe(
            ERROR_MESSAGES.EMAIL_ALREADY_TAKEN,
        );
    });

    it("should find the full record by login including the password hash", async () => {
        const login = unique("findlogin");

        await repository.create({
            name: "Grace",
            surname: "Hopper",
            login,
            password: PASSWORD,
            email: uniqueEmail("grace"),
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
        const email = uniqueEmail("findbyid");
        const created = await repository.create({
            name: "Alan",
            surname: "Turing",
            login,
            password: PASSWORD,
            email,
        });

        const found = await repository.findById(created.id);

        expect(found).toEqual(
            expect.objectContaining({
                id: created.id,
                name: "Alan",
                login,
                email,
                email_verified_at: null,
            }),
        );
        expect(found).not.toHaveProperty("password");
        expect(new Date(found?.created_at ?? "").getTime()).not.toBeNaN();

        const missing = await repository.findById(created.id + 1_000_000);

        expect(missing).toBeNull();
    });

    it("should find a user by email, and null for an unknown email", async () => {
        const email = uniqueEmail("byemail");
        const created = await repository.create({
            name: "Margaret",
            surname: "Hamilton",
            login: unique("byemail"),
            password: PASSWORD,
            email,
        });

        const found = await repository.findByEmail(email);

        expect(found).toEqual(
            expect.objectContaining({ id: created.id, email }),
        );

        const missing = await repository.findByEmail(uniqueEmail("missing"));

        expect(missing).toBeNull();
    });

    it("should list users without exposing passwords", async () => {
        const login = unique("listed");

        await repository.create({
            name: "Katherine",
            surname: "Johnson",
            login,
            password: PASSWORD,
            email: uniqueEmail("katherine"),
        });

        const all = (await repository.findAll()) as PublicUserRow[];
        const match = all.find((row) => row.login === login);

        expect(match).toEqual(expect.objectContaining({ login }));
        all.forEach((row) => {
            expect(row).not.toHaveProperty("password");
        });
    });

    it("should find credentials by id including the password hash, and null for an unknown id", async () => {
        const login = unique("creds");
        const created = await repository.create({
            name: "Radia",
            surname: "Perlman",
            login,
            password: PASSWORD,
            email: uniqueEmail("radia"),
        });

        const found = await repository.findCredentialsById(created.id);

        expect(found).toEqual({ id: created.id, password: PASSWORD });

        const missing = await repository.findCredentialsById(
            created.id + 1_000_000,
        );

        expect(missing).toBeNull();
    });

    it("should find credentials by email including the password hash, and null for an unknown email", async () => {
        const email = uniqueEmail("creds");
        const created = await repository.create({
            name: "Katie",
            surname: "Bouman",
            login: unique("creds-email"),
            password: PASSWORD,
            email,
        });

        const found = await repository.findCredentialsByEmail(email);

        expect(found).toEqual({ id: created.id, password: PASSWORD });

        const missing = await repository.findCredentialsByEmail(
            uniqueEmail("missing-creds"),
        );

        expect(missing).toBeNull();
    });

    it("should find a password-reset candidate by email with verification status, and null for an unknown email", async () => {
        const email = uniqueEmail("reset-candidate");
        const created = await repository.create({
            name: "Grace",
            surname: "Hopper",
            login: unique("reset-candidate"),
            password: PASSWORD,
            email,
        });

        const found = await repository.findPasswordResetCandidateByEmail(email);

        expect(found).toEqual({
            id: created.id,
            password: PASSWORD,
            email_verified_at: null,
        });

        const missing = await repository.findPasswordResetCandidateByEmail(
            uniqueEmail("missing-reset-candidate"),
        );

        expect(missing).toBeNull();
    });

    it("should update the password hash for a user", async () => {
        const created = await repository.create({
            name: "Hedy",
            surname: "Lamarr",
            login: unique("changepw"),
            password: PASSWORD,
            email: uniqueEmail("hedy"),
        });

        await repository.updatePassword(created.id, "new-hashed-password");

        const found = await repository.findCredentialsById(created.id);

        expect(found?.password).toBe("new-hashed-password");
    });

    it("should mark the email as verified", async () => {
        const created = await repository.create({
            name: "Mary",
            surname: "Jackson",
            login: unique("verify"),
            password: PASSWORD,
            email: uniqueEmail("mary"),
        });

        await repository.markEmailVerified(created.id);

        const found = await repository.findById(created.id);

        expect(found?.email_verified_at).not.toBeNull();
        expect(
            new Date(found?.email_verified_at ?? "").getTime(),
        ).not.toBeNaN();
    });
});
