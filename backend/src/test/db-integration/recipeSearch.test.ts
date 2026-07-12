import type { Pool } from "pg";

import Recipe from "domain/entities/Recipe";

import type { RecipeFilters } from "application/use-cases/recipes/recipe.types";

import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";

import {
    createIngredient,
    createPerson,
    createRecipeType,
    createUnitMeasurement,
} from "./fixtures";
import { createTestPool } from "./testPool";

interface RecipeSearchRow {
    id: number;
    title: string;
    cooking_time: number | null;
    ingredients: { id: number; name: string; allergens: string | null }[];
}

// targets the hand-built SQL in PgRecipeRepository.search.ts (ILIKE/ANY filters,
// GROUP BY + COUNT(*) OVER() pagination) - a mocked pool can't catch a syntax error here
describe("PgRecipeRepository search (real Postgres)", () => {
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

    // each test scopes its search by a fresh unique ingredient name, so tests
    // never see each other's recipes in the shared database
    async function createNamedIngredient(): Promise<{
        id: number;
        name: string;
    }> {
        const id = await createIngredient(pool, unitId);
        const result = await pool.query<{ name: string }>(
            `SELECT name FROM ingredients WHERE id = $1`,
            [id],
        );

        return { id, name: result.rows[0].name };
    }

    async function createRecipeWithIngredient(
        title: string,
        ingredientId: number,
        cookingTime: number,
        typeId?: number,
    ): Promise<number> {
        const recipe = Recipe.forCreation({
            title,
            content: "Search fixture.",
            person_id: ownerId,
            type_id: typeId,
            cooking_time: cookingTime,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const created = (await repository.create(recipe)) as { id: number };

        return created.id;
    }

    it("should filter by ingredient name, scoped by the unique fixture ingredient", async () => {
        const ingredient = await createNamedIngredient();
        const recipeId = await createRecipeWithIngredient(
            "Ingredient filter recipe",
            ingredient.id,
            10,
        );
        const filters: RecipeFilters = {
            ingredient_name: ingredient.name,
        };

        const result = await repository.search(filters);

        expect(result.items).toEqual([
            expect.objectContaining({ id: recipeId }),
        ]);
        expect(result.total).toBe(1);
    });

    it("should filter by type_ids", async () => {
        const ingredient = await createNamedIngredient();
        const typeId = await createRecipeType(pool);
        const recipeId = await createRecipeWithIngredient(
            "Type filter recipe",
            ingredient.id,
            10,
            typeId,
        );
        const filters: RecipeFilters = {
            ingredient_name: ingredient.name,
            type_ids: String(typeId),
        };

        const result = await repository.search(filters);

        expect(result.items).toEqual([
            expect.objectContaining({ id: recipeId }),
        ]);
    });

    it("should filter by a cooking-time range", async () => {
        const ingredient = await createNamedIngredient();
        const inRangeId = await createRecipeWithIngredient(
            "In-range recipe",
            ingredient.id,
            30,
        );

        await createRecipeWithIngredient("Too-fast recipe", ingredient.id, 5);
        await createRecipeWithIngredient("Too-slow recipe", ingredient.id, 90);

        const filters: RecipeFilters = {
            ingredient_name: ingredient.name,
            min_cooking_time: 20,
            max_cooking_time: 60,
        };

        const result = await repository.search(filters);

        expect(result.items).toEqual([
            expect.objectContaining({ id: inRangeId }),
        ]);
    });

    it("should sort by cooking time in the requested order", async () => {
        const ingredient = await createNamedIngredient();
        const fastId = await createRecipeWithIngredient(
            "Fast sort recipe",
            ingredient.id,
            5,
        );
        const slowId = await createRecipeWithIngredient(
            "Slow sort recipe",
            ingredient.id,
            50,
        );

        const ascending = (await repository.search({
            ingredient_name: ingredient.name,
            sort_order: "asc",
        })) as { items: RecipeSearchRow[] };
        const descending = (await repository.search({
            ingredient_name: ingredient.name,
            sort_order: "desc",
        })) as { items: RecipeSearchRow[] };

        expect(ascending.items.map((r) => r.id)).toEqual([fastId, slowId]);
        expect(descending.items.map((r) => r.id)).toEqual([slowId, fastId]);
    });

    it("should paginate with limit/offset and report the true total count", async () => {
        const ingredient = await createNamedIngredient();

        for (let i = 0; i < 3; i += 1) {
            await createRecipeWithIngredient(
                `Pagination recipe ${i}`,
                ingredient.id,
                10 + i,
            );
        }

        const firstPage = await repository.search({
            ingredient_name: ingredient.name,
            limit: 2,
            offset: 0,
        });
        const secondPage = await repository.search({
            ingredient_name: ingredient.name,
            limit: 2,
            offset: 2,
        });

        expect(firstPage.items).toHaveLength(2);
        expect(firstPage.total).toBe(3);
        expect(secondPage.items).toHaveLength(1);
        expect(secondPage.total).toBe(3);
    });

    it("should include each ingredient's allergens in the search results", async () => {
        const glutenId = await createIngredient(pool, unitId, "Gluten");
        const result = await pool.query<{ name: string }>(
            `SELECT name FROM ingredients WHERE id = $1`,
            [glutenId],
        );
        const glutenName = result.rows[0].name;
        const recipeId = await createRecipeWithIngredient(
            "Allergen search recipe",
            glutenId,
            10,
        );

        const search = (await repository.search({
            ingredient_name: glutenName,
        })) as { items: RecipeSearchRow[] };

        expect(search.items).toEqual([
            expect.objectContaining({
                id: recipeId,
                ingredients: [
                    expect.objectContaining({
                        name: glutenName,
                        allergens: "Gluten",
                    }),
                ],
            }),
        ]);
    });

    it("should scope searchByPerson to only that person's recipes", async () => {
        const otherPersonId = await createPerson(pool);
        const ingredient = await createNamedIngredient();
        const ownRecipeId = await createRecipeWithIngredient(
            "Own recipe",
            ingredient.id,
            10,
        );

        const otherRecipe = Recipe.forCreation({
            title: "Someone else's recipe",
            content: "Not visible in searchByPerson.",
            person_id: otherPersonId,
            cooking_time: 10,
            ingredients: [
                { id: ingredient.id, quantity_recipe_ingredients: 1 },
            ],
        });

        await repository.create(otherRecipe);

        const result = await repository.searchByPerson(ownerId, {
            ingredient_name: ingredient.name,
        });

        expect(result.items).toEqual([
            expect.objectContaining({ id: ownRecipeId }),
        ]);
    });
});
