import type { Pool } from "pg";

import { Menu } from "domain/entities/Menu";
import Recipe from "domain/entities/Recipe";

import PgMenuRepository from "infrastructure/persistence/pg/PgMenuRepository";
import PgPantryRepository from "infrastructure/persistence/pg/PgPantryRepository";
import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";

import {
    createIngredient,
    createMenuCategory,
    createPerson,
    createUnitMeasurement,
} from "./fixtures";
import { createTestPool } from "./testPool";

// far more recipes than any other test's menu, so it always tops the recipe-count extremes
const LARGE_MENU_CALORIES = Array.from({ length: 50 }, () => 10);

describe("PgMenuRepository (real Postgres)", () => {
    let pool: Pool;
    let menuRepository: PgMenuRepository;
    let recipeRepository: PgRecipeRepository;
    let pantryRepository: PgPantryRepository;
    let ownerId: number;
    let unitId: number;
    let categoryId: number;

    beforeAll(async () => {
        pool = createTestPool();
        menuRepository = new PgMenuRepository(pool);
        recipeRepository = new PgRecipeRepository(pool);
        pantryRepository = new PgPantryRepository(pool);
        ownerId = await createPerson(pool);
        unitId = await createUnitMeasurement(pool);
        categoryId = await createMenuCategory(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    async function createOwnedRecipe(quantity: number): Promise<{
        recipeId: number;
        ingredientId: number;
    }> {
        const ingredientId = await createIngredient(pool, unitId);
        const recipe = Recipe.forCreation({
            title: "Menu-linked recipe",
            content: "For menu tests.",
            language: "en",
            person_id: ownerId,
            ingredients: [
                { id: ingredientId, quantity_recipe_ingredients: quantity },
            ],
        });
        const created = (await recipeRepository.create(recipe)) as {
            id: number;
        };

        return { recipeId: created.id, ingredientId };
    }

    it("should persist a menu together with its menu_recipe rows", async () => {
        const { recipeId } = await createOwnedRecipe(1);
        const menu = Menu.forCreation({
            menuTitle: "Weekly plan",
            menuContent: "Notes.",
            language: "en",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });

        const menuId = await menuRepository.create(menu, [recipeId]);
        const detail = await menuRepository.findByIdWithRecipes(
            menuId,
            ownerId,
        );

        expect(detail?.menu.title).toBe("Weekly plan");
        expect(detail?.recipes.map((r) => r.recipe_id)).toEqual([recipeId]);
    });

    it("should report isOwner true for the creator and false for a different viewer (menus are public-read)", async () => {
        const { recipeId } = await createOwnedRecipe(1);
        const otherViewerId = await createPerson(pool);
        const menu = Menu.forCreation({
            menuTitle: "Shared plan",
            menuContent: "Visible to anyone.",
            language: "en",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });
        const menuId = await menuRepository.create(menu, [recipeId]);

        const asOwner = await menuRepository.findByIdWithRecipes(
            menuId,
            ownerId,
        );
        const asOtherViewer = await menuRepository.findByIdWithRecipes(
            menuId,
            otherViewerId,
        );

        expect(asOwner?.menu.isOwner).toBe(true);
        expect(asOtherViewer?.menu.isOwner).toBe(false);
        expect(asOtherViewer?.menu.title).toBe("Shared plan");
    });

    it("should report isOwner false and skip the missing-ingredients query for an anonymous (null) requester", async () => {
        const { recipeId } = await createOwnedRecipe(5);
        const menu = Menu.forCreation({
            menuTitle: "Guest-visible plan",
            menuContent: "Notes.",
            language: "en",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });
        const menuId = await menuRepository.create(menu, [recipeId]);

        const asGuest = await menuRepository.findByIdWithRecipes(menuId, null);

        expect(asGuest?.menu.isOwner).toBe(false);
        expect(asGuest?.recipes[0].missingIngredients).toEqual([]);
    });

    it("should compute missing ingredients against the viewer's own pantry, floored at zero", async () => {
        const { recipeId, ingredientId } = await createOwnedRecipe(5);
        const viewerId = await createPerson(pool);
        const menu = Menu.forCreation({
            menuTitle: "Pantry-aware plan",
            menuContent: "Notes.",
            language: "en",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });
        const menuId = await menuRepository.create(menu, [recipeId]);

        const beforeStock = await menuRepository.findByIdWithRecipes(
            menuId,
            viewerId,
        );

        expect(beforeStock?.recipes[0].missingIngredients).toEqual([
            expect.objectContaining({ missing_quantity: 5 }),
        ]);

        await pantryRepository.addIngredients(viewerId, [
            { id: ingredientId, quantity_person_ingradient: 10 },
        ]);
        const afterStock = await menuRepository.findByIdWithRecipes(
            menuId,
            viewerId,
        );

        expect(afterStock?.recipes[0].missingIngredients).toEqual([
            expect.objectContaining({ missing_quantity: 0 }),
        ]);
    });

    it("should collect distinct allergens across every recipe of the menu", async () => {
        const glutenId = await createIngredient(pool, unitId, ["gluten"]);
        const dairyId = await createIngredient(pool, unitId, ["milk"]);
        const glutenAgainId = await createIngredient(pool, unitId, ["gluten"]);
        const plainId = await createIngredient(pool, unitId);
        const makeRecipeUsing = async (ingredientIds: number[]) => {
            const recipe = Recipe.forCreation({
                title: "Allergen recipe",
                content: "For allergen tests.",
                language: "en",
                person_id: ownerId,
                ingredients: ingredientIds.map((id) => ({
                    id,
                    quantity_recipe_ingredients: 1,
                })),
            });

            return (await recipeRepository.create(recipe)) as { id: number };
        };
        const recipeA = await makeRecipeUsing([glutenId, plainId]);
        const recipeB = await makeRecipeUsing([dairyId, glutenAgainId]);
        const menu = Menu.forCreation({
            menuTitle: "Allergen plan",
            menuContent: "Notes.",
            language: "en",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeA.id, recipeB.id],
        });
        const menuId = await menuRepository.create(menu, [
            recipeA.id,
            recipeB.id,
        ]);

        const detail = await menuRepository.findByIdWithRecipes(
            menuId,
            ownerId,
        );

        expect(detail?.allergens).toEqual(["gluten", "milk"]);
    });

    it("should refuse to update or delete a menu owned by someone else", async () => {
        const { recipeId } = await createOwnedRecipe(1);
        const otherPersonId = await createPerson(pool);
        const menu = Menu.forCreation({
            menuTitle: "Protected plan",
            menuContent: "Notes.",
            language: "en",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });
        const menuId = await menuRepository.create(menu, [recipeId]);

        const update = Menu.forUpdate({
            menuTitle: "Hijacked plan",
            menuContent: "Hijacked.",
            language: "en",
            categoryId,
            recipeIds: [recipeId],
        });
        const updateResult = await menuRepository.update(
            menuId,
            otherPersonId,
            update,
            [recipeId],
        );
        const deleteResult = await menuRepository.deleteById(
            menuId,
            otherPersonId,
        );

        expect(updateResult).toBe(false);
        expect(deleteResult).toBeNull();

        const stillOriginal = await menuRepository.findByIdWithRecipes(
            menuId,
            ownerId,
        );

        expect(stillOriginal?.menu.title).toBe("Protected plan");
    });

    it("should delete a menu it owns, cascading to menu_recipe", async () => {
        const { recipeId } = await createOwnedRecipe(1);
        const menu = Menu.forCreation({
            menuTitle: "Disposable plan",
            menuContent: "Notes.",
            language: "en",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });
        const menuId = await menuRepository.create(menu, [recipeId]);

        const deleted = await menuRepository.deleteById(menuId, ownerId);
        const afterDelete = await menuRepository.findByIdWithRecipes(
            menuId,
            ownerId,
        );

        expect(deleted).toEqual({ photoKey: null });
        expect(afterDelete).toBeNull();
    });

    async function createRecipeWithCalories(
        caloriesPerUnit: number | null,
    ): Promise<number> {
        const ingredientId = await createIngredient(
            pool,
            unitId,
            [],
            caloriesPerUnit,
        );
        const recipe = Recipe.forCreation({
            title: "Calorie-bearing recipe",
            content: "For stats tests.",
            language: "en",
            person_id: ownerId,
            cooking_time: 2,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const created = (await recipeRepository.create(recipe)) as {
            id: number;
        };

        return created.id;
    }

    async function createMenuOfRecipes(
        menuTitle: string,
        calories: (number | null)[],
    ): Promise<number> {
        const recipeIds = await Promise.all(
            calories.map((value) => createRecipeWithCalories(value)),
        );
        const menu = Menu.forCreation({
            menuTitle,
            menuContent: "Notes.",
            language: "en",
            categoryId,
            personId: ownerId,
            recipeIds,
        });

        return menuRepository.create(menu, recipeIds);
    }

    it("should sum a menu's calories, recipes and cooking time into its statistics", async () => {
        const menuId = await createMenuOfRecipes(
            "Stats sum check",
            LARGE_MENU_CALORIES,
        );

        const stats = await menuRepository.getStats();

        expect(
            stats.mostRecipesMenus.find((entry) => entry.id === menuId),
        ).toMatchObject({
            recipe_count: 50,
            total_calories: 500,
            total_cooking_time: 100,
        });
    });

    it("should report a menu's calories as null and keep it out of the calorie extremes when one recipe has none", async () => {
        const menuId = await createMenuOfRecipes("Stats gap check", [
            ...LARGE_MENU_CALORIES,
            null,
        ]);

        const stats = await menuRepository.getStats();
        const caloric = [...stats.mostCaloricMenus, ...stats.leastCaloricMenus];

        expect(
            stats.mostRecipesMenus.find((entry) => entry.id === menuId),
        ).toMatchObject({ recipe_count: 51, total_calories: null });
        expect(caloric.some((entry) => entry.id === menuId)).toBe(false);
    });
});
