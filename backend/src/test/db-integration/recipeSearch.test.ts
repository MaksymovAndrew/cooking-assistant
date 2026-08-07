import type { Pool } from "pg";

import Recipe from "domain/entities/Recipe";

import type { RecipeFilters } from "application/use-cases/recipes/recipe.types";

import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";

import {
    createIngredient,
    createPerson,
    createRecipeType,
    createUnitMeasurement,
    unique,
} from "./fixtures";
import { createTestPool } from "./testPool";

interface RecipeSearchRow {
    id: number;
    title: string;
    cooking_time: number | null;
    ingredients: { id: number; name: string; allergens: string[] }[];
}

// targets the hand-built SQL in PgRecipeRepository.search.ts (EXISTS/ANY filters, GROUP BY + COUNT(*) OVER() pagination) - a mocked pool can't catch a syntax error here
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

    // each test scopes its search by a fresh unique ingredient, so tests never see each other's recipes in the shared database
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

    async function createRecipeWithIngredients(
        title: string,
        ingredientIds: number[],
        cookingTime: number,
        typeId?: number,
    ): Promise<number> {
        const recipe = Recipe.forCreation({
            title,
            content: "Search fixture.",
            person_id: ownerId,
            type_id: typeId,
            cooking_time: cookingTime,
            ingredients: ingredientIds.map((id) => ({
                id,
                quantity_recipe_ingredients: 1,
            })),
        });
        const created = (await repository.create(recipe)) as { id: number };

        return created.id;
    }

    it("should filter by recipe_name against the title, independently of ingredient_ids", async () => {
        const ingredient = await createNamedIngredient();
        const uniqueTitle = unique("Title filter recipe");
        const recipeId = await createRecipeWithIngredients(
            uniqueTitle,
            [ingredient.id],
            10,
        );

        await createRecipeWithIngredients(
            "Unrelated recipe",
            [ingredient.id],
            10,
        );

        const result = await repository.search(ownerId, {
            recipe_name: uniqueTitle,
        });

        expect(result.items).toEqual([
            expect.objectContaining({ id: recipeId }),
        ]);
        expect(result.total).toBe(1);
    });

    it("should report isOwner per viewer on search results, never the raw person_id", async () => {
        const ingredient = await createNamedIngredient();
        const otherPersonId = await createPerson(pool);
        const uniqueTitle = unique("isOwner search recipe");

        await createRecipeWithIngredients(uniqueTitle, [ingredient.id], 10);

        const asOwner = await repository.search(ownerId, {
            recipe_name: uniqueTitle,
        });
        const asOther = await repository.search(otherPersonId, {
            recipe_name: uniqueTitle,
        });
        const asGuest = await repository.search(null, {
            recipe_name: uniqueTitle,
        });

        expect(asOwner.items[0]).toMatchObject({ isOwner: true });
        expect(asOther.items[0]).toMatchObject({ isOwner: false });
        expect(asGuest.items[0]).toMatchObject({ isOwner: false });
        expect(asGuest.items[0]).not.toHaveProperty("person_id");
    });

    it("should treat literal % and _ in recipe_name as text, not SQL LIKE wildcards", async () => {
        const ingredient = await createNamedIngredient();
        const tag = unique("wildcard");
        // if the % below were sent unescaped to ILIKE, "50%" would become the wildcard pattern
        // %50%% (equivalent to %50%) and match this decoy too, since it also contains "50"
        const literalTitle = `${tag} 50% Whole Wheat`;
        const decoyTitle = `${tag} 50X Whole Wheat`;
        const recipeId = await createRecipeWithIngredients(
            literalTitle,
            [ingredient.id],
            10,
        );

        await createRecipeWithIngredients(decoyTitle, [ingredient.id], 10);

        const result = await repository.search(ownerId, {
            recipe_name: `${tag} 50%`,
        });

        expect(result.items).toEqual([
            expect.objectContaining({ id: recipeId }),
        ]);
        expect(result.total).toBe(1);
    });

    it("should filter by ingredient_ids, scoped by the unique fixture ingredient", async () => {
        const ingredient = await createNamedIngredient();
        const recipeId = await createRecipeWithIngredients(
            "Ingredient filter recipe",
            [ingredient.id],
            10,
        );
        const filters: RecipeFilters = {
            ingredient_ids: String(ingredient.id),
        };

        const result = await repository.search(ownerId, filters);

        expect(result.items).toEqual([
            expect.objectContaining({ id: recipeId }),
        ]);
        expect(result.total).toBe(1);
    });

    it("should match a recipe containing any one of several requested ingredient_ids", async () => {
        const first = await createNamedIngredient();
        const second = await createNamedIngredient();
        const recipeId = await createRecipeWithIngredients(
            "Or-semantics recipe",
            [first.id],
            10,
        );

        const result = await repository.search(ownerId, {
            ingredient_ids: `${first.id},${second.id}`,
        });

        expect(result.items).toEqual([
            expect.objectContaining({ id: recipeId }),
        ]);
    });

    it("should list every ingredient of a matched recipe, not just the one that matched the filter", async () => {
        const matched = await createNamedIngredient();
        const other = await createNamedIngredient();
        const recipeId = await createRecipeWithIngredients(
            "Full ingredient list recipe",
            [matched.id, other.id],
            10,
        );

        const result = (await repository.search(ownerId, {
            ingredient_ids: String(matched.id),
        })) as { items: RecipeSearchRow[] };
        const recipe = result.items.find((item) => item.id === recipeId);

        expect(recipe?.ingredients).toHaveLength(2);
        expect(recipe?.ingredients.map((i) => i.id).sort()).toEqual(
            [matched.id, other.id].sort(),
        );
    });

    it("should filter by type_ids", async () => {
        const ingredient = await createNamedIngredient();
        const typeId = await createRecipeType(pool);
        const recipeId = await createRecipeWithIngredients(
            "Type filter recipe",
            [ingredient.id],
            10,
            typeId,
        );
        const filters: RecipeFilters = {
            ingredient_ids: String(ingredient.id),
            type_ids: String(typeId),
        };

        const result = await repository.search(ownerId, filters);

        expect(result.items).toEqual([
            expect.objectContaining({ id: recipeId }),
        ]);
    });

    it("should filter by a cooking-time range", async () => {
        const ingredient = await createNamedIngredient();
        const inRangeId = await createRecipeWithIngredients(
            "In-range recipe",
            [ingredient.id],
            30,
        );

        await createRecipeWithIngredients(
            "Too-fast recipe",
            [ingredient.id],
            5,
        );
        await createRecipeWithIngredients(
            "Too-slow recipe",
            [ingredient.id],
            90,
        );

        const filters: RecipeFilters = {
            ingredient_ids: String(ingredient.id),
            min_cooking_time: 20,
            max_cooking_time: 60,
        };

        const result = await repository.search(ownerId, filters);

        expect(result.items).toEqual([
            expect.objectContaining({ id: inRangeId }),
        ]);
    });

    it("should filter by a calorie range, excluding recipes with no calorie data", async () => {
        const inRangeIngredient = await createIngredient(pool, unitId, [], 300);
        const tooLightIngredient = await createIngredient(pool, unitId, [], 50);
        const tooHeavyIngredient = await createIngredient(
            pool,
            unitId,
            [],
            900,
        );
        const noDataIngredient = await createIngredient(pool, unitId);

        const inRangeId = await createRecipeWithIngredients(
            "In-range calorie recipe",
            [inRangeIngredient],
            10,
        );

        await createRecipeWithIngredients(
            "Too-light calorie recipe",
            [tooLightIngredient],
            10,
        );
        await createRecipeWithIngredients(
            "Too-heavy calorie recipe",
            [tooHeavyIngredient],
            10,
        );
        await createRecipeWithIngredients(
            "No-data calorie recipe",
            [noDataIngredient],
            10,
        );

        const filters: RecipeFilters = {
            ingredient_ids: [
                inRangeIngredient,
                tooLightIngredient,
                tooHeavyIngredient,
                noDataIngredient,
            ].join(","),
            min_calories: 200,
            max_calories: 500,
        };

        const result = await repository.search(ownerId, filters);

        expect(result.items).toEqual([
            expect.objectContaining({ id: inRangeId }),
        ]);
    });

    it("should sort by cooking time in the requested order", async () => {
        const ingredient = await createNamedIngredient();
        const fastId = await createRecipeWithIngredients(
            "Fast sort recipe",
            [ingredient.id],
            5,
        );
        const slowId = await createRecipeWithIngredients(
            "Slow sort recipe",
            [ingredient.id],
            50,
        );

        const ascending = (await repository.search(ownerId, {
            ingredient_ids: String(ingredient.id),
            sort_order: "asc",
        })) as { items: RecipeSearchRow[] };
        const descending = (await repository.search(ownerId, {
            ingredient_ids: String(ingredient.id),
            sort_order: "desc",
        })) as { items: RecipeSearchRow[] };

        expect(ascending.items.map((r) => r.id)).toEqual([fastId, slowId]);
        expect(descending.items.map((r) => r.id)).toEqual([slowId, fastId]);
    });

    it("should paginate with limit/offset and report the true total count", async () => {
        const ingredient = await createNamedIngredient();

        for (let i = 0; i < 3; i += 1) {
            await createRecipeWithIngredients(
                `Pagination recipe ${i}`,
                [ingredient.id],
                10 + i,
            );
        }

        const firstPage = await repository.search(ownerId, {
            ingredient_ids: String(ingredient.id),
            limit: 2,
            offset: 0,
        });
        const secondPage = await repository.search(ownerId, {
            ingredient_ids: String(ingredient.id),
            limit: 2,
            offset: 2,
        });

        expect(firstPage.items).toHaveLength(2);
        expect(firstPage.total).toBe(3);
        expect(secondPage.items).toHaveLength(1);
        expect(secondPage.total).toBe(3);
    });

    it("should include each ingredient's allergens in the search results", async () => {
        const glutenId = await createIngredient(pool, unitId, ["gluten"]);
        const result = await pool.query<{ name: string }>(
            `SELECT name FROM ingredients WHERE id = $1`,
            [glutenId],
        );
        const glutenName = result.rows[0].name;
        const recipeId = await createRecipeWithIngredients(
            "Allergen search recipe",
            [glutenId],
            10,
        );

        const search = (await repository.search(ownerId, {
            ingredient_ids: String(glutenId),
        })) as { items: RecipeSearchRow[] };

        expect(search.items).toEqual([
            expect.objectContaining({
                id: recipeId,
                ingredients: [
                    expect.objectContaining({
                        name: glutenName,
                        allergens: ["gluten"],
                    }),
                ],
            }),
        ]);
    });

    it("should scope searchByPerson to only that person's recipes", async () => {
        const otherPersonId = await createPerson(pool);
        const ingredient = await createNamedIngredient();
        const ownRecipeId = await createRecipeWithIngredients(
            "Own recipe",
            [ingredient.id],
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
            ingredient_ids: String(ingredient.id),
        });

        expect(result.items).toEqual([
            expect.objectContaining({ id: ownRecipeId }),
        ]);
    });

    it("should only return recipes whose every ingredient is in the requester's pantry when in_pantry is set", async () => {
        const requesterId = await createPerson(pool);
        const inPantry = await createNamedIngredient();
        const notInPantry = await createNamedIngredient();
        const fullyStockedId = await createRecipeWithIngredients(
            "Fully stocked recipe",
            [inPantry.id],
            10,
        );

        await createRecipeWithIngredients(
            "Missing an ingredient recipe",
            [inPantry.id, notInPantry.id],
            10,
        );
        await pool.query(
            `INSERT INTO person_ingredients (person_id, ingredient_id) VALUES ($1, $2)`,
            [requesterId, inPantry.id],
        );

        const result = await repository.search(requesterId, {
            ingredient_ids: `${inPantry.id},${notInPantry.id}`,
            in_pantry: true,
        });

        expect(result.items).toEqual([
            expect.objectContaining({ id: fullyStockedId }),
        ]);
    });

    it("should exclude a recipe when the pantry has the ingredient but not enough of it", async () => {
        const requesterId = await createPerson(pool);
        const ingredient = await createNamedIngredient();
        const recipe = Recipe.forCreation({
            title: "Needs half a kilo recipe",
            content: "Quantity fixture.",
            person_id: ownerId,
            cooking_time: 10,
            ingredients: [
                { id: ingredient.id, quantity_recipe_ingredients: 0.5 },
            ],
        });
        const created = (await repository.create(recipe)) as { id: number };

        await pool.query(
            `INSERT INTO person_ingredients (person_id, ingredient_id, quantity_person_ingradient) VALUES ($1, $2, $3)`,
            [requesterId, ingredient.id, 0.2],
        );

        const shortOnStock = await repository.search(requesterId, {
            ingredient_ids: String(ingredient.id),
            in_pantry: true,
        });

        expect(
            shortOnStock.items.some(
                (item) => (item as { id: number }).id === created.id,
            ),
        ).toBe(false);

        await pool.query(
            `UPDATE person_ingredients SET quantity_person_ingradient = $1 WHERE person_id = $2 AND ingredient_id = $3`,
            [0.5, requesterId, ingredient.id],
        );

        const fullyStocked = await repository.search(requesterId, {
            ingredient_ids: String(ingredient.id),
            in_pantry: true,
        });

        expect(fullyStocked.items).toEqual([
            expect.objectContaining({ id: created.id }),
        ]);
    });

    it("should not match a recipe with no ingredients when in_pantry is set", async () => {
        const requesterId = await createPerson(pool);

        // Recipe.forCreation enforces non-empty ingredients, so insert directly to reach the edge case the second EXISTS guards against
        const created = await pool.query<{ id: number }>(
            `INSERT INTO recipes (title, content, person_id, cooking_time) VALUES ($1, $2, $3, $4) RETURNING id`,
            [
                "Ingredient-less recipe",
                "Should never pass an all-ingredients-in-pantry check.",
                ownerId,
                10,
            ],
        );

        const result = await repository.search(requesterId, {
            in_pantry: true,
        });

        expect(
            result.items.some(
                (item) => (item as { id: number }).id === created.rows[0].id,
            ),
        ).toBe(false);
    });

    it("should keep the in_pantry filter scoped to the requesting person in searchByPerson", async () => {
        const inPantry = await createNamedIngredient();
        const ownRecipeId = await createRecipeWithIngredients(
            "Own fully stocked recipe",
            [inPantry.id],
            10,
        );

        await pool.query(
            `INSERT INTO person_ingredients (person_id, ingredient_id) VALUES ($1, $2)`,
            [ownerId, inPantry.id],
        );

        const result = await repository.searchByPerson(ownerId, {
            ingredient_ids: String(inPantry.id),
            in_pantry: true,
        });

        expect(result.items).toEqual([
            expect.objectContaining({ id: ownRecipeId }),
        ]);
    });

    it("should search recipes for an anonymous (null) requester without in_pantry", async () => {
        const ingredient = await createNamedIngredient();
        const recipeId = await createRecipeWithIngredients(
            "Anonymous search fixture",
            [ingredient.id],
            10,
        );

        const result = await repository.search(null, {
            ingredient_ids: String(ingredient.id),
        });

        expect(result.items).toEqual([
            expect.objectContaining({ id: recipeId }),
        ]);
    });
});
