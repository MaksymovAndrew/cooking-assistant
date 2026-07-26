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

interface MenuDetail {
    menu: { id: number; title: string; isOwner: boolean };
    recipes: {
        recipe_id: number;
        missingIngredients: {
            ingredient_name: string;
            missing_quantity: number;
        }[];
    }[];
    allergens: string[];
}

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
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });

        const menuId = (await menuRepository.create(menu, [
            recipeId,
        ])) as number;
        const detail = (await menuRepository.findByIdWithRecipes(
            menuId,
            ownerId,
        )) as MenuDetail;

        expect(detail.menu.title).toBe("Weekly plan");
        expect(detail.recipes.map((r) => r.recipe_id)).toEqual([recipeId]);
    });

    it("should report isOwner true for the creator and false for a different viewer (menus are public-read)", async () => {
        const { recipeId } = await createOwnedRecipe(1);
        const otherViewerId = await createPerson(pool);
        const menu = Menu.forCreation({
            menuTitle: "Shared plan",
            menuContent: "Visible to anyone.",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });
        const menuId = (await menuRepository.create(menu, [
            recipeId,
        ])) as number;

        const asOwner = (await menuRepository.findByIdWithRecipes(
            menuId,
            ownerId,
        )) as MenuDetail;
        const asOtherViewer = (await menuRepository.findByIdWithRecipes(
            menuId,
            otherViewerId,
        )) as MenuDetail;

        expect(asOwner.menu.isOwner).toBe(true);
        expect(asOtherViewer.menu.isOwner).toBe(false);
        expect(asOtherViewer.menu.title).toBe("Shared plan");
    });

    it("should compute missing ingredients against the viewer's own pantry, floored at zero", async () => {
        const { recipeId, ingredientId } = await createOwnedRecipe(5);
        const viewerId = await createPerson(pool);
        const menu = Menu.forCreation({
            menuTitle: "Pantry-aware plan",
            menuContent: "Notes.",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });
        const menuId = (await menuRepository.create(menu, [
            recipeId,
        ])) as number;

        const beforeStock = (await menuRepository.findByIdWithRecipes(
            menuId,
            viewerId,
        )) as MenuDetail;

        expect(beforeStock.recipes[0].missingIngredients).toEqual([
            expect.objectContaining({ missing_quantity: 5 }),
        ]);

        await pantryRepository.addIngredients(viewerId, [
            { id: ingredientId, quantity_person_ingradient: 10 },
        ]);
        const afterStock = (await menuRepository.findByIdWithRecipes(
            menuId,
            viewerId,
        )) as MenuDetail;

        expect(afterStock.recipes[0].missingIngredients).toEqual([
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
            categoryId,
            personId: ownerId,
            recipeIds: [recipeA.id, recipeB.id],
        });
        const menuId = (await menuRepository.create(menu, [
            recipeA.id,
            recipeB.id,
        ])) as number;

        const detail = (await menuRepository.findByIdWithRecipes(
            menuId,
            ownerId,
        )) as MenuDetail;

        expect(detail.allergens).toEqual(["gluten", "milk"]);
    });

    it("should refuse to update or delete a menu owned by someone else", async () => {
        const { recipeId } = await createOwnedRecipe(1);
        const otherPersonId = await createPerson(pool);
        const menu = Menu.forCreation({
            menuTitle: "Protected plan",
            menuContent: "Notes.",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });
        const menuId = (await menuRepository.create(menu, [
            recipeId,
        ])) as number;

        const update = Menu.forUpdate(menuId, {
            menuTitle: "Hijacked plan",
            menuContent: "Hijacked.",
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
        expect(deleteResult).toBe(false);

        const stillOriginal = (await menuRepository.findByIdWithRecipes(
            menuId,
            ownerId,
        )) as MenuDetail;

        expect(stillOriginal.menu.title).toBe("Protected plan");
    });

    it("should delete a menu it owns, cascading to menu_recipe", async () => {
        const { recipeId } = await createOwnedRecipe(1);
        const menu = Menu.forCreation({
            menuTitle: "Disposable plan",
            menuContent: "Notes.",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId],
        });
        const menuId = (await menuRepository.create(menu, [
            recipeId,
        ])) as number;

        const deleted = await menuRepository.deleteById(menuId, ownerId);
        const afterDelete = await menuRepository.findByIdWithRecipes(
            menuId,
            ownerId,
        );

        expect(deleted).toBe(true);
        expect(afterDelete).toBeNull();
    });
});
