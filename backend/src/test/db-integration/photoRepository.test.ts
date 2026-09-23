import { randomUUID } from "node:crypto";
import type { Pool } from "pg";

import type { PhotoTarget } from "domain/repositories/PhotoRepository";

import PgMenuRepository from "infrastructure/persistence/pg/PgMenuRepository";
import PgPhotoRepository from "infrastructure/persistence/pg/PgPhotoRepository";
import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";
import PgUserRepository from "infrastructure/persistence/pg/PgUserRepository";
import { PHOTO_TABLES } from "infrastructure/persistence/pg/photoTables";

import { createMenuCategory, createPerson, unique } from "./fixtures";
import { createTestPool } from "./testPool";

// targets the returned previous key (the file an upload displaced), the owner check that turns
// someone else's record into a 404, and the keys each delete hands back for file cleanup
describe("PgPhotoRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgPhotoRepository;
    let categoryId: number;

    beforeAll(async () => {
        pool = createTestPool();
        repository = new PgPhotoRepository(pool);
        categoryId = await createMenuCategory(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    async function createRecipe(ownerId: number): Promise<number> {
        const result = await pool.query<{ id: number }>(
            `INSERT INTO recipes (title, content, person_id)
             VALUES ($1, 'Photo fixture.', $2) RETURNING id`,
            [unique("photo-recipe"), ownerId],
        );

        return result.rows[0].id;
    }

    async function storedKey(
        target: PhotoTarget,
        targetId: number,
    ): Promise<string | null> {
        const { table, idColumn, keyColumn } = PHOTO_TABLES[target];
        const result = await pool.query<{ key: string | null }>(
            `SELECT ${keyColumn} AS key FROM ${table} WHERE ${idColumn} = $1`,
            [targetId],
        );

        return result.rows[0].key;
    }

    async function createMenu(ownerId: number): Promise<number> {
        const result = await pool.query<{ menu_id: number }>(
            `INSERT INTO menu (menu_title, person_id, category_id)
             VALUES ($1, $2, $3) RETURNING menu_id`,
            [unique("photo-menu"), ownerId, categoryId],
        );

        return result.rows[0].menu_id;
    }

    it("should report no previous key for a first photo, then the one it replaced", async () => {
        const ownerId = await createPerson(pool);
        const recipeId = await createRecipe(ownerId);
        const first = randomUUID();
        const second = randomUUID();

        expect(
            await repository.replace(ownerId, "recipe", recipeId, first),
        ).toEqual({ previousKey: null });
        expect(
            await repository.replace(ownerId, "recipe", recipeId, second),
        ).toEqual({ previousKey: first });
        expect(await storedKey("recipe", recipeId)).toBe(second);
    });

    it("should leave someone else's recipe untouched and report it as missing", async () => {
        const ownerId = await createPerson(pool);
        const strangerId = await createPerson(pool);
        const recipeId = await createRecipe(ownerId);
        const ownersKey = randomUUID();

        await repository.replace(ownerId, "recipe", recipeId, ownersKey);

        expect(
            await repository.replace(
                strangerId,
                "recipe",
                recipeId,
                randomUUID(),
            ),
        ).toBeNull();
        expect(await storedKey("recipe", recipeId)).toBe(ownersKey);
    });

    it("should clear a menu cover and hand back the key it held", async () => {
        const ownerId = await createPerson(pool);
        const menuId = await createMenu(ownerId);
        const cover = randomUUID();

        await repository.replace(ownerId, "menu", menuId, cover);

        expect(await repository.replace(ownerId, "menu", menuId, null)).toEqual(
            { previousKey: cover },
        );
        expect(await storedKey("menu", menuId)).toBeNull();
    });

    it("should store an avatar on the account itself", async () => {
        const personId = await createPerson(pool);
        const avatar = randomUUID();

        expect(
            await repository.replace(personId, "avatar", personId, avatar),
        ).toEqual({ previousKey: null });
        expect(await storedKey("avatar", personId)).toBe(avatar);
    });

    it("should hand back the photo a deleted recipe and menu held", async () => {
        const ownerId = await createPerson(pool);
        const recipeId = await createRecipe(ownerId);
        const menuId = await createMenu(ownerId);
        const recipeKey = randomUUID();

        await repository.replace(ownerId, "recipe", recipeId, recipeKey);

        expect(
            await new PgRecipeRepository(pool).deleteById(recipeId, ownerId),
        ).toEqual({ photoKey: recipeKey });
        expect(
            await new PgMenuRepository(pool).deleteById(menuId, ownerId),
        ).toEqual({ photoKey: null });
    });

    it("should hand back every photo a deleted account held and none of anyone else's", async () => {
        const ownerId = await createPerson(pool);
        const strangerId = await createPerson(pool);
        const recipeId = await createRecipe(ownerId);
        const menuId = await createMenu(ownerId);
        const strangersRecipeId = await createRecipe(strangerId);
        const keys = {
            recipe: randomUUID(),
            menu: randomUUID(),
            avatar: randomUUID(),
        };

        await createRecipe(ownerId);
        await repository.replace(ownerId, "recipe", recipeId, keys.recipe);
        await repository.replace(ownerId, "menu", menuId, keys.menu);
        await repository.replace(ownerId, "avatar", ownerId, keys.avatar);
        await repository.replace(
            strangerId,
            "recipe",
            strangersRecipeId,
            randomUUID(),
        );

        const deletedKeys = await new PgUserRepository(pool).delete(ownerId);

        expect(deletedKeys.sort()).toEqual(
            [keys.recipe, keys.menu, keys.avatar].sort(),
        );
    });
});
