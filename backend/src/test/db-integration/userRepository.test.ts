import type { Pool } from "pg";

import { ERROR_MESSAGES } from "constants/errorMessages";
import { Menu } from "domain/entities/Menu";
import Recipe from "domain/entities/Recipe";
import { AppError } from "domain/errors/AppError";

import PgMenuRepository from "infrastructure/persistence/pg/PgMenuRepository";
import PgPantryRepository from "infrastructure/persistence/pg/PgPantryRepository";
import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";
import PgUserRepository from "infrastructure/persistence/pg/PgUserRepository";

import { catchError } from "test/helpers/assertions";

import {
    createIngredient,
    createMenuCategory,
    createUnitMeasurement,
    unique,
} from "./fixtures";
import { createTestPool } from "./testPool";

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

    it("should update the profile's name, surname, and avatar", async () => {
        const created = await repository.create({
            name: "Sally",
            surname: "Ride",
            login: unique("profile"),
            password: PASSWORD,
            email: uniqueEmail("sally"),
        });

        await repository.updateProfile(created.id, {
            name: "Sally-Kristen",
            surname: "Ride-Jones",
            avatar: "tomato",
        });

        const found = await repository.findById(created.id);

        expect(found).toEqual(
            expect.objectContaining({
                name: "Sally-Kristen",
                surname: "Ride-Jones",
                avatar: "tomato",
            }),
        );
    });

    // exercises the real transactional cascade - a person's recipe linked into someone
    // ELSE's menu, their own menu, and their own pantry data - since menu.person_id and
    // menu_recipe.recipe_id have no ON DELETE CASCADE, mocked-repository tests can't catch a
    // half-cleaned delete leaving orphaned rows behind
    it("should delete a person and clean up their recipes, menus, and cross-referenced menu_recipe rows", async () => {
        const menuRepository = new PgMenuRepository(pool);
        const recipeRepository = new PgRecipeRepository(pool);
        const pantryRepository = new PgPantryRepository(pool);

        const owner = await repository.create({
            name: "Owner",
            surname: "ToDelete",
            login: unique("delete-owner"),
            password: PASSWORD,
            email: uniqueEmail("delete-owner"),
        });
        const otherPerson = await repository.create({
            name: "Other",
            surname: "Person",
            login: unique("delete-other"),
            password: PASSWORD,
            email: uniqueEmail("delete-other"),
        });
        const ownerId = owner.id;
        const otherPersonId = otherPerson.id;
        const unitId = await createUnitMeasurement(pool);
        const categoryId = await createMenuCategory(pool);
        const ingredientId = await createIngredient(pool, unitId);

        const ownedRecipe = Recipe.forCreation({
            title: "Owner's recipe",
            content: "Linked into someone else's menu too.",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const { id: recipeId } = (await recipeRepository.create(
            ownedRecipe,
        )) as { id: number };

        const ownMenu = Menu.forCreation({
            menuTitle: "Owner's own menu",
            menuContent: "Notes.",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });
        const ownMenuId = (await menuRepository.create(ownMenu, [
            recipeId,
        ])) as number;

        const othersMenu = Menu.forCreation({
            menuTitle: "Someone else's menu",
            menuContent: "Borrows the owner's recipe.",
            categoryId,
            personId: otherPersonId,
            recipeIds: [recipeId],
        });
        const othersMenuId = (await menuRepository.create(othersMenu, [
            recipeId,
        ])) as number;

        await pantryRepository.addIngredients(ownerId, [
            { id: ingredientId, quantity_person_ingradient: 2 },
        ]);

        await repository.delete(ownerId);

        expect(await repository.findById(ownerId)).toBeNull();

        const remainingRecipe = await pool.query(
            `SELECT id FROM recipes WHERE id = $1`,
            [recipeId],
        );

        expect(remainingRecipe.rowCount).toBe(0);

        const ownMenuRow = await pool.query(
            `SELECT menu_id FROM menu WHERE menu_id = $1`,
            [ownMenuId],
        );

        expect(ownMenuRow.rowCount).toBe(0);

        // the other person's menu itself survives - only its reference to the deleted recipe is cleared
        const othersMenuRow = await pool.query(
            `SELECT menu_id FROM menu WHERE menu_id = $1`,
            [othersMenuId],
        );

        expect(othersMenuRow.rowCount).toBe(1);

        const othersMenuRecipes = await pool.query(
            `SELECT recipe_id FROM menu_recipe WHERE menu_id = $1`,
            [othersMenuId],
        );

        expect(othersMenuRecipes.rowCount).toBe(0);

        const remainingPantry = await pool.query(
            `SELECT ingredient_id FROM person_ingredients WHERE person_id = $1`,
            [ownerId],
        );

        expect(remainingPantry.rowCount).toBe(0);
    });
});
