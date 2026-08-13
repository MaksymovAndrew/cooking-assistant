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

interface RecipeDetail {
    id: number;
    title: string;
    isOwner: boolean;
    calories_per_portion: number | null;
    ingredients: {
        id: number;
        name: string;
        quantity_recipe_ingredients: number;
        unit_name: string;
        allergens: string[];
        calories_per_unit: number | null;
    }[];
}

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
            person_id: ownerId,
            type_id: typeId,
            cooking_time: 90,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 2 }],
        });

        const created = (await repository.create(recipe)) as { id: number };
        const detail = (await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        )) as RecipeDetail;

        expect(detail.title).toBe("Borscht");
        expect(detail.ingredients).toEqual([
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
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 4 }],
        });

        const created = (await repository.create(recipe)) as { id: number };
        const computed = (await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        )) as RecipeDetail;

        expect(computed.calories_per_portion).toBe(200);
        expect(computed.ingredients[0].calories_per_unit).toBe(50);

        const update = Recipe.forUpdate({
            title: "Rice bowl",
            content: "Steamed rice.",
            calories_override: 999,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 4 }],
        });

        await repository.update(created.id, ownerId, update);

        const overridden = (await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        )) as RecipeDetail;

        expect(overridden.calories_per_portion).toBe(999);
    });

    it("should report isOwner true for the creator and false for another person", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const otherPersonId = await createPerson(pool);
        const recipe = Recipe.forCreation({
            title: "Omelette",
            content: "Eggs and butter.",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 3 }],
        });

        const created = (await repository.create(recipe)) as { id: number };

        const asOwner = (await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        )) as RecipeDetail;
        const asOther = (await repository.findByIdWithIngredients(
            created.id,
            otherPersonId,
        )) as RecipeDetail;

        expect(asOwner.isOwner).toBe(true);
        expect(asOther.isOwner).toBe(false);
    });

    it("should report isOwner false, not null, for an anonymous (null) requester", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const recipe = Recipe.forCreation({
            title: "Anonymous view",
            content: "Guest-visible recipe.",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });

        const created = (await repository.create(recipe)) as { id: number };

        const asGuest = (await repository.findByIdWithIngredients(
            created.id,
            null,
        )) as RecipeDetail;

        expect(asGuest.isOwner).toBe(false);
    });

    it("should refuse to update a recipe owned by someone else", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const otherPersonId = await createPerson(pool);
        const recipe = Recipe.forCreation({
            title: "Pancakes",
            content: "Flour, milk, eggs.",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const created = (await repository.create(recipe)) as { id: number };

        const update = Recipe.forUpdate({
            title: "Hijacked title",
            content: "Hijacked content.",
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 9 }],
        });
        const result = await repository.update(
            created.id,
            otherPersonId,
            update,
        );

        expect(result).toBeNull();

        const stillOriginal = (await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        )) as RecipeDetail;

        expect(stillOriginal.title).toBe("Pancakes");
    });

    it("should replace ingredients on update rather than merging them", async () => {
        const firstIngredientId = await createIngredient(pool, unitId);
        const secondIngredientId = await createIngredient(pool, unitId);
        const recipe = Recipe.forCreation({
            title: "Salad",
            content: "Greens.",
            person_id: ownerId,
            ingredients: [
                { id: firstIngredientId, quantity_recipe_ingredients: 1 },
            ],
        });
        const created = (await repository.create(recipe)) as { id: number };

        const update = Recipe.forUpdate({
            title: "Salad",
            content: "Greens and dressing.",
            ingredients: [
                { id: secondIngredientId, quantity_recipe_ingredients: 5 },
            ],
        });

        await repository.update(created.id, ownerId, update);

        const detail = (await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        )) as RecipeDetail;

        expect(detail.ingredients).toEqual([
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
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const created = (await repository.create(recipe)) as { id: number };

        const deniedForOther = await repository.deleteById(
            created.id,
            otherPersonId,
        );

        expect(deniedForOther).toBe(false);

        const deletedByOwner = await repository.deleteById(created.id, ownerId);

        expect(deletedByOwner).toBe(true);

        const afterDelete = await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        );

        expect(afterDelete).toBeNull();
    });

    it("should not leak person_id on the rows returned by findAllWithIngredients", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const recipe = Recipe.forCreation({
            title: "Leak check",
            content: "Should not expose its owner.",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });

        await repository.create(recipe);
        const rows = (await repository.findAllWithIngredients()) as Record<
            string,
            unknown
        >[];
        const mine = rows.find((row) => row.title === "Leak check");

        expect(mine).not.toHaveProperty("person_id");
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
            person_id: ownerId,
            cooking_time: 1,
            ingredients: [
                {
                    id: highCalorieIngredient,
                    quantity_recipe_ingredients: 1,
                },
            ],
        });

        await repository.create(recipe);
        const stats = await repository.getStats();

        expect(stats).not.toHaveProperty("person_id");
        expect(
            stats.fastestRecipes.find((r) => r.title === STATS_CHECK_TITLE),
        ).toEqual(
            expect.objectContaining({
                title: STATS_CHECK_TITLE,
                cookingTime: 1,
            }),
        );
        expect(
            stats.mostCaloricRecipes.find((r) => r.title === STATS_CHECK_TITLE),
        ).toEqual(
            expect.objectContaining({
                title: STATS_CHECK_TITLE,
                caloriesPerPortion: 100_000,
            }),
        );
    });

    it("should only return ids that actually exist", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const recipe = Recipe.forCreation({
            title: "Stew",
            content: "Meat and vegetables.",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const created = (await repository.create(recipe)) as { id: number };
        const impossibleId = created.id + 1_000_000;

        const existingIds = await repository.findExistingIds([
            created.id,
            impossibleId,
        ]);

        expect(existingIds).toEqual([created.id]);
    });
});
