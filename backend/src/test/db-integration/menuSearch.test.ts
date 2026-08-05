import type { Pool } from "pg";

import { Menu } from "domain/entities/Menu";
import Recipe from "domain/entities/Recipe";

import type { MenuFilters } from "application/use-cases/menus/menu.types";

import PgMenuRepository from "infrastructure/persistence/pg/PgMenuRepository";
import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";

import {
    createIngredient,
    createMenuCategory,
    createPerson,
    createUnitMeasurement,
    unique,
} from "./fixtures";
import { createTestPool } from "./testPool";

// targets the hand-built SQL in PgMenuRepository.queries.ts (ILIKE/ANY filters, COUNT(*) OVER() pagination) - a mocked pool can't catch a syntax error here
describe("PgMenuRepository search (real Postgres)", () => {
    let pool: Pool;
    let menuRepository: PgMenuRepository;
    let recipeRepository: PgRecipeRepository;
    let ownerId: number;
    let unitId: number;
    let recipeId: number;

    beforeAll(async () => {
        pool = createTestPool();
        menuRepository = new PgMenuRepository(pool);
        recipeRepository = new PgRecipeRepository(pool);
        ownerId = await createPerson(pool);
        unitId = await createUnitMeasurement(pool);

        const ingredientId = await createIngredient(pool, unitId);
        const recipe = Recipe.forCreation({
            title: "Menu search fixture recipe",
            content: "For menu search tests.",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const created = (await recipeRepository.create(recipe)) as {
            id: number;
        };

        recipeId = created.id;
    });

    afterAll(async () => {
        await pool.end();
    });

    async function createOwnedMenu(
        title: string,
        categoryId: number,
        personId = ownerId,
    ): Promise<number> {
        const menu = Menu.forCreation({
            menuTitle: title,
            menuContent: "Search fixture.",
            categoryId,
            personId,
            recipeIds: [recipeId],
        });

        return (await menuRepository.create(menu, [recipeId])) as number;
    }

    it("should filter by menu title", async () => {
        const categoryId = await createMenuCategory(pool);
        const uniqueTitle = unique("Title filter menu");
        const menuId = await createOwnedMenu(uniqueTitle, categoryId);

        await createOwnedMenu(unique("Unrelated menu"), categoryId);

        const filters: MenuFilters = { menu_name: uniqueTitle };
        const result = await menuRepository.findAll(filters, null);

        expect(result.items).toEqual([expect.objectContaining({ id: menuId })]);
        expect(result.total).toBe(1);
    });

    it("should treat literal % and _ in menu_name as text, not SQL LIKE wildcards", async () => {
        const categoryId = await createMenuCategory(pool);
        const tag = unique("wildcard");
        // if the % below were sent unescaped to ILIKE, "week 1%" would become the wildcard
        // pattern %week 1%% (equivalent to %week 1%) and match this decoy too
        const literalTitle = `${tag} week 1% off`;
        const decoyTitle = `${tag} week 1X off`;
        const menuId = await createOwnedMenu(literalTitle, categoryId);

        await createOwnedMenu(decoyTitle, categoryId);

        const result = await menuRepository.findAll(
            { menu_name: `${tag} week 1%` },
            null,
        );

        expect(result.items).toEqual([expect.objectContaining({ id: menuId })]);
        expect(result.total).toBe(1);
    });

    it("should filter by category_ids", async () => {
        const categoryId = await createMenuCategory(pool);
        const menuId = await createOwnedMenu(
            unique("Category filter menu"),
            categoryId,
        );

        const result = await menuRepository.findAll(
            { category_ids: String(categoryId) },
            null,
        );

        expect(result.items).toEqual([expect.objectContaining({ id: menuId })]);
        expect(result.total).toBe(1);
    });

    it("should paginate with limit/offset and report the true total count", async () => {
        const categoryId = await createMenuCategory(pool);

        for (let i = 0; i < 3; i += 1) {
            await createOwnedMenu(unique(`Pagination menu ${i}`), categoryId);
        }

        const firstPage = await menuRepository.findAll(
            { category_ids: String(categoryId), limit: 2, offset: 0 },
            null,
        );
        const secondPage = await menuRepository.findAll(
            { category_ids: String(categoryId), limit: 2, offset: 2 },
            null,
        );

        expect(firstPage.items).toHaveLength(2);
        expect(firstPage.total).toBe(3);
        expect(secondPage.items).toHaveLength(1);
        expect(secondPage.total).toBe(3);
    });

    it("should report the recipe count per menu, including zero for a menu with none", async () => {
        const categoryId = await createMenuCategory(pool);
        const ingredientId = await createIngredient(pool, unitId);
        const secondRecipe = Recipe.forCreation({
            title: unique("Second menu search fixture recipe"),
            content: "For menu search tests.",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const secondRecipeId = (
            (await recipeRepository.create(secondRecipe)) as { id: number }
        ).id;
        const twoRecipeMenu = Menu.forCreation({
            menuTitle: unique("Two-recipe menu"),
            menuContent: "Search fixture.",
            categoryId,
            personId: ownerId,
            recipeIds: [recipeId, secondRecipeId],
        });
        const twoRecipeMenuId = (await menuRepository.create(twoRecipeMenu, [
            recipeId,
            secondRecipeId,
        ])) as number;
        const emptyMenuId = await createOwnedMenu(
            unique("Empty menu"),
            categoryId,
        );

        await pool.query("DELETE FROM menu_recipe WHERE menu_id = $1", [
            emptyMenuId,
        ]);

        const result = (await menuRepository.findAll(
            { category_ids: String(categoryId) },
            null,
        )) as { items: { id: number; recipe_count: number }[] };

        expect(result.items).toContainEqual(
            expect.objectContaining({
                id: twoRecipeMenuId,
                recipe_count: 2,
            }),
        );
        expect(result.items).toContainEqual(
            expect.objectContaining({ id: emptyMenuId, recipe_count: 0 }),
        );
    });

    it("should scope searchByPerson to only that person's menus", async () => {
        const otherPersonId = await createPerson(pool);
        const categoryId = await createMenuCategory(pool);
        const uniqueTitle = unique("Own person menu");
        const ownMenuId = await createOwnedMenu(uniqueTitle, categoryId);

        await createOwnedMenu(uniqueTitle, categoryId, otherPersonId);

        const result = await menuRepository.searchByPerson(ownerId, {
            menu_name: uniqueTitle,
        });

        expect(result.items).toEqual([
            expect.objectContaining({ id: ownMenuId }),
        ]);
        expect(result.total).toBe(1);
    });
});
