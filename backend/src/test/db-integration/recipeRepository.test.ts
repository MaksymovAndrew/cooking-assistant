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
    ingredients: {
        id: number;
        name: string;
        quantity_recipe_ingredients: number;
        unit_name: string;
        allergens: string | null;
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
        const ingredientId = await createIngredient(pool, unitId, "Gluten");
        const typeId = await createRecipeType(pool);
        const recipe = Recipe.forCreation({
            title: "Borscht",
            content: "Classic beet soup.",
            person_id: ownerId,
            type_id: typeId,
            cooking_time: 90,
            // free-form text, not a number - the column is VARCHAR
            servings: "a full pot",
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 2 }],
        });

        const created = (await repository.create(recipe)) as { id: number };
        const detail = (await repository.findByIdWithIngredients(
            created.id,
            ownerId,
        )) as RecipeDetail & { servings: string };

        expect(detail.title).toBe("Borscht");
        expect(detail.servings).toBe("a full pot");
        expect(detail.ingredients).toEqual([
            expect.objectContaining({
                id: ingredientId,
                quantity_recipe_ingredients: 2,
                allergens: "Gluten",
            }),
        ]);
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
