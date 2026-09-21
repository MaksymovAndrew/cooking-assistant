import type { Pool } from "pg";

import Menu from "domain/entities/Menu";
import Recipe from "domain/entities/Recipe";
import type { RecordRating } from "domain/repositories/recordAuthor";

import PgMenuRepository from "infrastructure/persistence/pg/PgMenuRepository";
import PgRatingRepository from "infrastructure/persistence/pg/PgRatingRepository";
import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";
import PgUserRepository from "infrastructure/persistence/pg/PgUserRepository";

import {
    createIngredient,
    createMenuCategory,
    createPerson,
    createUnitMeasurement,
    unique,
} from "./fixtures";
import { createTestPool } from "./testPool";

interface Totals {
    rating_sum: number;
    rating_count: number;
}

// targets the running totals the vote-table triggers keep (including through a cascade), the per-viewer
// read columns, the rating sort and filter, and the CASCADE foreign keys
describe("PgRatingRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgRatingRepository;
    let recipeRepository: PgRecipeRepository;
    let menuRepository: PgMenuRepository;
    let userRepository: PgUserRepository;
    let unitId: number;
    let categoryId: number;

    beforeAll(async () => {
        pool = createTestPool();
        repository = new PgRatingRepository(pool);
        recipeRepository = new PgRecipeRepository(pool);
        menuRepository = new PgMenuRepository(pool);
        userRepository = new PgUserRepository(pool);
        unitId = await createUnitMeasurement(pool);
        categoryId = await createMenuCategory(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    async function createRecipe(ownerId: number, title: string) {
        const ingredientId = await createIngredient(pool, unitId);
        const recipe = Recipe.forCreation({
            title,
            content: "Rating fixture.",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const { id } = (await recipeRepository.create(recipe)) as {
            id: number;
        };

        return id;
    }

    async function createMenu(ownerId: number, title: string) {
        const recipeId = await createRecipe(ownerId, unique("Menu recipe"));
        const menu = Menu.forCreation({
            menuTitle: title,
            menuContent: "Notes.",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });

        return (await menuRepository.create(menu, [recipeId])) as number;
    }

    async function recipeTotals(recipeId: number): Promise<Totals> {
        const result = await pool.query<Totals>(
            `SELECT rating_sum, rating_count FROM recipes WHERE id = $1`,
            [recipeId],
        );

        return result.rows[0];
    }

    async function createPeople(count: number): Promise<number[]> {
        return Promise.all(
            Array.from({ length: count }, () => createPerson(pool)),
        );
    }

    it("should count a vote once and move the totals by the difference when it changes", async () => {
        const ownerId = await createPerson(pool);
        const [first, second] = await createPeople(2);
        const recipeId = await createRecipe(ownerId, unique("Soup"));

        await repository.rate(first, "recipe", recipeId, 5);
        await repository.rate(second, "recipe", recipeId, 2);
        await repository.rate(first, "recipe", recipeId, 3);

        expect(await recipeTotals(recipeId)).toEqual({
            rating_sum: 5,
            rating_count: 2,
        });
    });

    it("should give a removed vote back and treat removing a missing one as a no-op", async () => {
        const ownerId = await createPerson(pool);
        const [voter] = await createPeople(1);
        const recipeId = await createRecipe(ownerId, unique("Stew"));

        await repository.rate(voter, "recipe", recipeId, 4);
        await repository.remove(voter, "recipe", recipeId);
        await repository.remove(voter, "recipe", recipeId);

        expect(await recipeTotals(recipeId)).toEqual({
            rating_sum: 0,
            rating_count: 0,
        });
    });

    it("should refuse the owner's own vote and report a missing record, writing nothing", async () => {
        const ownerId = await createPerson(pool);
        const recipeId = await createRecipe(ownerId, unique("Own"));

        const own = await repository.rate(ownerId, "recipe", recipeId, 5);
        const missingRecipe = await repository.rate(
            ownerId,
            "recipe",
            999_999_999,
            5,
        );
        const missingMenu = await repository.rate(
            ownerId,
            "menu",
            999_999_999,
            5,
        );

        expect(own).toBe("own_record");
        expect(missingRecipe).toBe("not_found");
        expect(missingMenu).toBe("not_found");
        expect(await recipeTotals(recipeId)).toEqual({
            rating_sum: 0,
            rating_count: 0,
        });
    });

    it("should keep every concurrent vote and count a double tap once", async () => {
        const ownerId = await createPerson(pool);
        const voters = await createPeople(8);
        const recipeId = await createRecipe(ownerId, unique("Busy"));

        await Promise.all([
            ...voters.map((voter) =>
                repository.rate(voter, "recipe", recipeId, 4),
            ),
            repository.rate(voters[0], "recipe", recipeId, 4),
            repository.remove(voters[1], "recipe", recipeId),
        ]);

        const totals = await recipeTotals(recipeId);
        const stored = await pool.query<Totals>(
            `SELECT COALESCE(SUM(value), 0)::int AS rating_sum, COUNT(*)::int AS rating_count
             FROM recipe_ratings WHERE recipe_id = $1`,
            [recipeId],
        );

        expect(totals).toEqual(stored.rows[0]);
    });

    it("should show the average, the count and the viewer's own vote, with null for a guest", async () => {
        const ownerId = await createPerson(pool);
        const [first, second] = await createPeople(2);
        const title = unique("Rated recipe");
        const recipeId = await createRecipe(ownerId, title);

        await repository.rate(first, "recipe", recipeId, 5);
        await repository.rate(second, "recipe", recipeId, 4);

        const asVoter = await recipeRepository.search(first, {
            recipe_name: title,
        });
        const asGuest = await recipeRepository.search(null, {
            recipe_name: title,
        });
        const detail = (await recipeRepository.findByIdWithIngredients(
            recipeId,
            second,
        )) as RecordRating;

        expect(asVoter.items.map((row) => row.ratingAverage)).toEqual([4.5]);
        expect(asVoter.items.map((row) => row.myRating)).toEqual([5]);
        expect(asGuest.items.map((row) => row.myRating)).toEqual([null]);
        expect(detail).toMatchObject({
            ratingAverage: 4.5,
            ratingCount: 2,
            myRating: 4,
        });
    });

    it("should report an unrated recipe as having no average rather than zero", async () => {
        const ownerId = await createPerson(pool);
        const title = unique("Unrated recipe");

        await createRecipe(ownerId, title);

        const result = await recipeRepository.search(ownerId, {
            recipe_name: title,
        });

        expect(result.items[0]).toMatchObject({
            ratingAverage: null,
            ratingCount: 0,
            myRating: null,
        });
    });

    it("should rank one five-star vote below many votes averaging almost as high", async () => {
        const ownerId = await createPerson(pool);
        const voters = await createPeople(6);
        const prefix = unique("Ranked recipe");
        const lucky = await createRecipe(ownerId, `${prefix} lucky`);
        const proven = await createRecipe(ownerId, `${prefix} proven`);
        const unrated = await createRecipe(ownerId, `${prefix} unrated`);

        await repository.rate(voters[0], "recipe", lucky, 5);
        await Promise.all(
            voters.map((voter, index) =>
                repository.rate(voter, "recipe", proven, index === 0 ? 4 : 5),
            ),
        );

        const result = await recipeRepository.search(null, {
            recipe_name: prefix,
            sort_order: "rating",
        });

        expect(result.items.map((row) => row.id)).toEqual([
            proven,
            lucky,
            unrated,
        ]);
    });

    it("should keep only records averaging four or more with the top-rated filter", async () => {
        const ownerId = await createPerson(pool);
        const [first, second] = await createPeople(2);
        const prefix = unique("Filtered menu");
        const good = await createMenu(ownerId, `${prefix} good`);
        const middling = await createMenu(ownerId, `${prefix} middling`);

        await createMenu(ownerId, `${prefix} unrated`);
        await repository.rate(first, "menu", good, 5);
        await repository.rate(second, "menu", good, 3);
        await repository.rate(first, "menu", middling, 3);

        const filtered = await menuRepository.findAll(
            { menu_name: prefix, top_rated: true },
            first,
        );
        const sorted = await menuRepository.findAll(
            { menu_name: prefix, sort_order: "rating" },
            null,
        );
        const detail = (await menuRepository.findByIdWithRecipes(
            good,
            first,
        )) as { menu: RecordRating };

        expect(filtered.items.map((row) => [row.id, row.myRating])).toEqual([
            [good, 5],
        ]);
        expect(sorted.items.map((row) => row.id).slice(0, 2)).toEqual([
            good,
            middling,
        ]);
        expect(detail.menu).toMatchObject({
            ratingAverage: 4,
            ratingCount: 2,
            myRating: 5,
        });
    });

    it("should drop votes with their record and give the totals back when the voter's account goes", async () => {
        const ownerId = await createPerson(pool);
        const [voter, leaver] = await createPeople(2);
        const recipeId = await createRecipe(ownerId, unique("Deleted recipe"));
        const keptId = await createRecipe(ownerId, unique("Kept recipe"));

        await repository.rate(voter, "recipe", recipeId, 4);
        await repository.rate(leaver, "recipe", keptId, 2);
        await recipeRepository.deleteById(recipeId, ownerId);
        await userRepository.delete(leaver);

        const remaining = await pool.query<{ count: number }>(
            `SELECT COUNT(*)::int AS count FROM recipe_ratings WHERE recipe_id = ANY($1::int[])`,
            [[recipeId, keptId]],
        );

        expect(remaining.rows[0].count).toBe(0);
        expect(await recipeTotals(keptId)).toEqual({
            rating_sum: 0,
            rating_count: 0,
        });
    });
});
