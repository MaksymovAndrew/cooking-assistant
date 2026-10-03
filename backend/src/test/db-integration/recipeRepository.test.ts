import type { Pool } from "pg";

import Recipe from "domain/entities/Recipe";

import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";

import {
    createIngredient,
    createPerson,
    createRecipeType,
    createUnitMeasurement,
} from "./fixtures";
import { createTestPool } from "./testPool";

// longer than any other test's recipe takes, so it always tops the slowest recipes
const LONGEST_COOKING_TIME = 100_000;

describe("PgRecipeRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgRecipeRepository;
    let ownerId: number;
    let unitId: number;

    beforeAll(async () => {
        pool = createTestPool();
        repository = new PgRecipeRepository(pool);
        ownerId = await createPerson(pool);
        unitId = await createUnitMeasurement(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    it("should persist a recipe together with its ingredient rows", async () => {
        const ingredientId = await createIngredient(pool, unitId, ["gluten"]);
        const typeId = await createRecipeType(pool);
        const recipe = Recipe.forCreation({
            title: "Borscht",
            content: "Classic beet soup.",
            language: "en",
            person_id: ownerId,
            type_id: typeId,
            cooking_time: 90,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 2 }],
        });

        const created = await repository.create(recipe);
        const detail = await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        );

        expect(detail?.title).toBe("Borscht");
        expect(detail?.ingredients).toEqual([
            expect.objectContaining({
                id: ingredientId,
                quantity_recipe_ingredients: 2,
                allergens: ["gluten"],
            }),
        ]);
    });

    it("should compute calories from ingredient quantities and let a manual override win", async () => {
        const ingredientId = await createIngredient(pool, unitId, [], 50);
        const recipe = Recipe.forCreation({
            title: "Rice bowl",
            content: "Steamed rice.",
            language: "en",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 4 }],
        });

        const created = await repository.create(recipe);
        const computed = await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        );

        expect(computed?.calories_per_portion).toBe(200);
        expect(computed?.ingredients[0].calories_per_unit).toBe(50);

        const update = Recipe.forUpdate({
            title: "Rice bowl",
            content: "Steamed rice.",
            language: "en",
            calories_override: 999,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 4 }],
        });

        await repository.update(created.id, ownerId, update);

        const overridden = await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        );

        expect(overridden?.calories_per_portion).toBe(999);
    });

    it("should report isOwner true for the creator and false for another person", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const otherPersonId = await createPerson(pool);
        const recipe = Recipe.forCreation({
            title: "Omelette",
            content: "Eggs and butter.",
            language: "en",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 3 }],
        });

        const created = await repository.create(recipe);

        const asOwner = await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        );
        const asOther = await repository.findByIdWithIngredients(
            created.id,
            otherPersonId,
        );

        expect(asOwner?.isOwner).toBe(true);
        expect(asOther?.isOwner).toBe(false);
    });

    it("should report isOwner false, not null, for an anonymous (null) requester", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const recipe = Recipe.forCreation({
            title: "Anonymous view",
            content: "Guest-visible recipe.",
            language: "en",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });

        const created = await repository.create(recipe);

        const asGuest = await repository.findByIdWithIngredients(
            created.id,
            null,
        );

        expect(asGuest?.isOwner).toBe(false);
    });

    it("should name the author by first name and surname initial, never by login or email", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const recipe = Recipe.forCreation({
            title: "Signed dish",
            content: "Shows who made it.",
            language: "en",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });

        const created = await repository.create(recipe);

        const asGuest = await repository.findByIdWithIngredients(
            created.id,
            null,
        );

        expect(asGuest?.author).toEqual({
            name: "Test",
            surname_initial: "U",
            avatar: null,
            avatar_photo_key: null,
        });
        expect(asGuest?.photo_key).toBeNull();
    });

    it("should refuse to update a recipe owned by someone else", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const otherPersonId = await createPerson(pool);
        const recipe = Recipe.forCreation({
            title: "Pancakes",
            content: "Flour, milk, eggs.",
            language: "en",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const created = await repository.create(recipe);

        const update = Recipe.forUpdate({
            title: "Hijacked title",
            content: "Hijacked content.",
            language: "en",
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 9 }],
        });
        const result = await repository.update(
            created.id,
            otherPersonId,
            update,
        );

        expect(result).toBeNull();

        const stillOriginal = await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        );

        expect(stillOriginal?.title).toBe("Pancakes");
    });

    it("should replace ingredients on update rather than merging them", async () => {
        const firstIngredientId = await createIngredient(pool, unitId);
        const secondIngredientId = await createIngredient(pool, unitId);
        const recipe = Recipe.forCreation({
            title: "Salad",
            content: "Greens.",
            language: "en",
            person_id: ownerId,
            ingredients: [
                { id: firstIngredientId, quantity_recipe_ingredients: 1 },
            ],
        });
        const created = await repository.create(recipe);

        const update = Recipe.forUpdate({
            title: "Salad",
            content: "Greens and dressing.",
            language: "en",
            ingredients: [
                { id: secondIngredientId, quantity_recipe_ingredients: 5 },
            ],
        });

        await repository.update(created.id, ownerId, update);

        const detail = await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        );

        expect(detail?.ingredients).toEqual([
            expect.objectContaining({
                id: secondIngredientId,
                quantity_recipe_ingredients: 5,
            }),
        ]);
    });

    it("should delete a recipe it owns and refuse to delete one it does not", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const otherPersonId = await createPerson(pool);
        const recipe = Recipe.forCreation({
            title: "Soup",
            content: "Broth.",
            language: "en",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const created = await repository.create(recipe);

        const deniedForOther = await repository.deleteById(
            created.id,
            otherPersonId,
        );

        expect(deniedForOther).toBeNull();

        const deletedByOwner = await repository.deleteById(created.id, ownerId);

        expect(deletedByOwner).toEqual({ photoKey: null });

        const afterDelete = await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        );

        expect(afterDelete).toBeNull();
    });

    it("should aggregate recipe stats without leaking person_id and reflect this recipe's own numbers", async () => {
        const STATS_CHECK_TITLE = "Stats aggregate check";
        const highCalorieIngredient = await createIngredient(
            pool,
            unitId,
            [],
            100_000,
        );
        const recipe = Recipe.forCreation({
            title: STATS_CHECK_TITLE,
            content: "Deliberately extreme values for a stable assertion.",
            language: "en",
            person_id: ownerId,
            cooking_time: 1,
            ingredients: [
                {
                    id: highCalorieIngredient,
                    quantity_recipe_ingredients: 1,
                },
            ],
        });

        const created = await repository.create(recipe);
        const stats = await repository.getStats();

        // exact, so a leaked person_id or any other extra column fails
        expect(stats.fastestRecipes.find((r) => r.id === created.id)).toEqual({
            id: created.id,
            title: STATS_CHECK_TITLE,
            cookingTime: 1,
        });
        expect(
            stats.mostCaloricRecipes.find((r) => r.id === created.id),
        ).toEqual({
            id: created.id,
            title: STATS_CHECK_TITLE,
            caloriesPerPortion: 100_000,
        });
    });

    it("should leave a recipe with no cooking time out of the slowest recipes and the averages by type", async () => {
        const SLOWEST_TITLE = "Slowest dish";
        const ingredientId = await createIngredient(pool, unitId);
        const untimedTypeId = await createRecipeType(pool);
        const ingredients = [
            { id: ingredientId, quantity_recipe_ingredients: 1 },
        ];
        const slowest = await repository.create(
            Recipe.forCreation({
                title: SLOWEST_TITLE,
                content: "Takes longer than anything else.",
                language: "en",
                person_id: ownerId,
                cooking_time: LONGEST_COOKING_TIME,
                ingredients,
            }),
        );

        await repository.create(
            Recipe.forCreation({
                title: "Untimed dish",
                content: "No cooking time given.",
                language: "en",
                person_id: ownerId,
                type_id: untimedTypeId,
                ingredients,
            }),
        );
        const stats = await repository.getStats();

        expect(stats.slowestRecipes[0]).toEqual({
            id: slowest.id,
            title: SLOWEST_TITLE,
            cookingTime: LONGEST_COOKING_TIME,
        });
        expect(
            stats.averageCookingTimesByType.map(
                (entry) => entry.averageCookingTime,
            ),
        ).not.toContain(null);
    });

    it("should gather the recipes without a type into a last bucket of their own, so the distribution adds up to the recipe count", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const typeId = await createRecipeType(pool);
        const ingredients = [
            { id: ingredientId, quantity_recipe_ingredients: 1 },
        ];

        await repository.create(
            Recipe.forCreation({
                title: "Typed dish",
                content: "Has a type.",
                language: "en",
                person_id: ownerId,
                type_id: typeId,
                cooking_time: 10,
                ingredients,
            }),
        );
        await repository.create(
            Recipe.forCreation({
                title: "Untyped dish",
                content: "Has no type.",
                language: "en",
                person_id: ownerId,
                cooking_time: 10,
                ingredients,
            }),
        );
        const stats = await repository.getStats();
        const distributed = stats.stats.reduce(
            (sum, bucket) => sum + bucket.count,
            0,
        );
        const untyped = stats.stats.at(-1);

        expect(distributed).toBe(stats.recipesCount);
        expect(untyped?.typeName).toBeNull();
        expect(untyped?.count).toBeGreaterThanOrEqual(1);
        // last whatever its size, so a real type is still the most used one
        expect(stats.mostUsedType).toEqual(stats.stats[0]);
        expect(stats.stats[0].typeName).not.toBeNull();
        expect(
            stats.averageCookingTimesByType.map((entry) => entry.typeName),
        ).not.toContain(null);
    });

    it("should only return ids that actually exist", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const recipe = Recipe.forCreation({
            title: "Stew",
            content: "Meat and vegetables.",
            language: "en",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const created = await repository.create(recipe);
        const impossibleId = created.id + 1_000_000;

        const existingIds = await repository.findExistingIds([
            created.id,
            impossibleId,
        ]);

        expect(existingIds).toEqual([created.id]);
    });
});
