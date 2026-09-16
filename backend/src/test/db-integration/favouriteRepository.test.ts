import type { Pool } from "pg";

import Menu from "domain/entities/Menu";
import Recipe from "domain/entities/Recipe";

import PgFavouriteRepository from "infrastructure/persistence/pg/PgFavouriteRepository";
import PgMenuRepository from "infrastructure/persistence/pg/PgMenuRepository";
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

interface FlaggedRow {
    id: number;
    isFavourite: boolean | null;
}

// targets the idempotent insert, the per-viewer isFavourite flag, the favourites filter and the CASCADE
// foreign keys - hand-written delete transactions would break silently without them
describe("PgFavouriteRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgFavouriteRepository;
    let recipeRepository: PgRecipeRepository;
    let menuRepository: PgMenuRepository;
    let userRepository: PgUserRepository;
    let unitId: number;
    let categoryId: number;

    beforeAll(async () => {
        pool = createTestPool();
        repository = new PgFavouriteRepository(pool);
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
            content: "Favourite fixture.",
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

    async function countFavourites(
        table: "recipe_favourites" | "menu_favourites",
        column: "recipe_id" | "menu_id",
        id: number,
    ): Promise<number> {
        const result = await pool.query<{ count: number }>(
            `SELECT COUNT(*)::int AS count FROM ${table} WHERE ${column} = $1`,
            [id],
        );

        return result.rows[0].count;
    }

    it("should add a favourite once even when added twice, and report the target as found", async () => {
        const ownerId = await createPerson(pool);
        const recipeId = await createRecipe(ownerId, unique("Soup"));

        const first = await repository.add(ownerId, "recipe", recipeId);
        const second = await repository.add(ownerId, "recipe", recipeId);

        expect(first).toBe(true);
        expect(second).toBe(true);
        expect(
            await countFavourites("recipe_favourites", "recipe_id", recipeId),
        ).toBe(1);
    });

    it("should report a missing recipe or menu as not found without inserting anything", async () => {
        const personId = await createPerson(pool);

        const recipe = await repository.add(personId, "recipe", 999_999_999);
        const menu = await repository.add(personId, "menu", 999_999_999);

        expect(recipe).toBe(false);
        expect(menu).toBe(false);
    });

    it("should flag isFavourite per viewer in recipe search and detail, and null for a guest", async () => {
        const ownerId = await createPerson(pool);
        const viewerId = await createPerson(pool);
        const title = unique("Flagged recipe");
        const recipeId = await createRecipe(ownerId, title);

        await repository.add(viewerId, "recipe", recipeId);

        const asViewer = await recipeRepository.search(viewerId, {
            recipe_name: title,
        });
        const asOwner = await recipeRepository.search(ownerId, {
            recipe_name: title,
        });
        const asGuest = await recipeRepository.search(null, {
            recipe_name: title,
        });
        const detailAsViewer = (await recipeRepository.findByIdWithIngredients(
            recipeId,
            viewerId,
        )) as FlaggedRow;
        const detailAsGuest = (await recipeRepository.findByIdWithIngredients(
            recipeId,
            null,
        )) as FlaggedRow;

        expect(asViewer.items.map((row) => row.isFavourite)).toEqual([true]);
        expect(asOwner.items.map((row) => row.isFavourite)).toEqual([false]);
        expect(asGuest.items.map((row) => row.isFavourite)).toEqual([null]);
        expect(detailAsViewer.isFavourite).toBe(true);
        expect(detailAsGuest.isFavourite).toBeNull();
    });

    it("should list only the viewer's favourite recipes with the favourites filter", async () => {
        const ownerId = await createPerson(pool);
        const viewerId = await createPerson(pool);
        const prefix = unique("Filtered recipe");
        const favouriteId = await createRecipe(ownerId, `${prefix} A`);

        await createRecipe(ownerId, `${prefix} B`);
        await repository.add(viewerId, "recipe", favouriteId);

        const result = await recipeRepository.search(viewerId, {
            recipe_name: prefix,
            favourites: true,
        });

        expect(result.items.map((row) => row.id)).toEqual([favouriteId]);
        expect(result.total).toBe(1);
    });

    it("should flag and filter favourite menus per viewer, with null for a guest", async () => {
        const ownerId = await createPerson(pool);
        const viewerId = await createPerson(pool);
        const prefix = unique("Weekend menu");
        const favouriteId = await createMenu(ownerId, `${prefix} A`);

        await createMenu(ownerId, `${prefix} B`);
        await repository.add(viewerId, "menu", favouriteId);

        const filtered = await menuRepository.findAll(
            { menu_name: prefix, favourites: true },
            viewerId,
        );
        const asGuest = await menuRepository.findAll(
            { menu_name: prefix },
            null,
        );
        const detail = (await menuRepository.findByIdWithRecipes(
            favouriteId,
            viewerId,
        )) as { menu: FlaggedRow };

        expect(filtered.items.map((row) => [row.id, row.isFavourite])).toEqual([
            [favouriteId, true],
        ]);
        expect(asGuest.items.map((row) => row.isFavourite)).toEqual([
            null,
            null,
        ]);
        expect(detail.menu.isFavourite).toBe(true);
    });

    it("should remove a favourite and treat removing a missing one as a no-op", async () => {
        const personId = await createPerson(pool);
        const menuId = await createMenu(personId, unique("Removable menu"));

        await repository.add(personId, "menu", menuId);
        await repository.remove(personId, "menu", menuId);
        await repository.remove(personId, "menu", menuId);

        expect(
            await countFavourites("menu_favourites", "menu_id", menuId),
        ).toBe(0);
    });

    it("should drop favourites when their recipe or menu is deleted", async () => {
        const ownerId = await createPerson(pool);
        const viewerId = await createPerson(pool);
        const recipeId = await createRecipe(ownerId, unique("Deleted recipe"));
        const menuId = await createMenu(ownerId, unique("Deleted menu"));

        await repository.add(viewerId, "recipe", recipeId);
        await repository.add(viewerId, "menu", menuId);
        await recipeRepository.deleteById(recipeId, ownerId);
        await menuRepository.deleteById(menuId, ownerId);

        expect(
            await countFavourites("recipe_favourites", "recipe_id", recipeId),
        ).toBe(0);
        expect(
            await countFavourites("menu_favourites", "menu_id", menuId),
        ).toBe(0);
    });

    it("should delete accounts on both sides of a favourite", async () => {
        const ownerId = await createPerson(pool);
        const viewerId = await createPerson(pool);
        const recipeId = await createRecipe(ownerId, unique("Shared recipe"));
        const menuId = await createMenu(ownerId, unique("Shared menu"));
        const viewerRecipeId = await createRecipe(viewerId, unique("Own"));

        await repository.add(viewerId, "recipe", recipeId);
        await repository.add(viewerId, "menu", menuId);
        await repository.add(ownerId, "recipe", viewerRecipeId);

        await userRepository.delete(ownerId);
        await userRepository.delete(viewerId);

        expect(
            await countFavourites("recipe_favourites", "recipe_id", recipeId),
        ).toBe(0);
        expect(
            await countFavourites("menu_favourites", "menu_id", menuId),
        ).toBe(0);
        expect(
            await countFavourites(
                "recipe_favourites",
                "recipe_id",
                viewerRecipeId,
            ),
        ).toBe(0);
    });
});
