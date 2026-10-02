import type { Pool } from "pg";

import PgDatabaseProbe from "infrastructure/persistence/pg/PgDatabaseProbe";
import {
    committed,
    rolledBack,
    withTransaction,
} from "infrastructure/persistence/pg/transaction";

import {
    createIngredient,
    createMenu,
    createMenuCategory,
    createPerson,
    createRecipe,
    createUnitMeasurement,
} from "./fixtures";
import { createTestPool } from "./testPool";

// the keys, checks and cascades the 5.0 schema migration added, and the transaction helper built on them
describe("schema hardening (real Postgres)", () => {
    let pool: Pool;
    let categoryId: number;
    let unitId: number;

    beforeAll(async () => {
        pool = createTestPool();
        categoryId = await createMenuCategory(pool);
        unitId = await createUnitMeasurement(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    const countRows = async (sql: string, params: unknown[]) => {
        const result = await pool.query<{ total: number }>(
            `SELECT COUNT(*)::int AS total FROM (${sql}) rows`,
            params,
        );

        return result.rows[0].total;
    };

    it("should refuse the same recipe twice in one menu", async () => {
        const personId = await createPerson(pool);
        const recipeId = await createRecipe(pool, personId, []);
        const menuId = await createMenu(pool, personId, categoryId, [recipeId]);

        await expect(
            pool.query(
                `INSERT INTO menu_recipe (menu_id, recipe_id) VALUES ($1, $2)`,
                [menuId, recipeId],
            ),
        ).rejects.toThrow(/menu_recipe_menu_recipe_key/);
    });

    it("should take a deleted recipe out of the menus that held it", async () => {
        const personId = await createPerson(pool);
        const recipeId = await createRecipe(pool, personId, []);
        const menuId = await createMenu(pool, personId, categoryId, [recipeId]);

        await pool.query(`DELETE FROM recipes WHERE id = $1`, [recipeId]);

        expect(
            await countRows(`SELECT 1 FROM menu_recipe WHERE menu_id = $1`, [
                menuId,
            ]),
        ).toBe(0);
    });

    it("should delete a person's menus with the person", async () => {
        const personId = await createPerson(pool);

        await createMenu(pool, personId, categoryId, []);
        await pool.query(`DELETE FROM person WHERE id = $1`, [personId]);

        expect(
            await countRows(`SELECT 1 FROM menu WHERE person_id = $1`, [
                personId,
            ]),
        ).toBe(0);
    });

    it.each([
        [`UPDATE recipes SET cooking_time = 0 WHERE id = $1`],
        [
            `UPDATE recipe_ingredients SET quantity_recipe_ingredients = 0 WHERE recipe_id = $1`,
        ],
    ])("should refuse a non-positive amount: %s", async (sql) => {
        const personId = await createPerson(pool);
        const ingredientId = await createIngredient(pool, unitId);
        const recipeId = await createRecipe(pool, personId, [
            { ingredientId, quantity: 1 },
        ]);

        await expect(pool.query(sql, [recipeId])).rejects.toThrow(/check/);
    });

    it("should refuse a second reference row under a name already taken", async () => {
        const result = await pool.query<{ category_name: string }>(
            `SELECT category_name FROM menu_category WHERE menu_category_id = $1`,
            [categoryId],
        );

        await expect(
            pool.query(
                `INSERT INTO menu_category (category_name) VALUES ($1)`,
                [result.rows[0].category_name],
            ),
        ).rejects.toThrow(/menu_category_category_name_key/);
    });

    it("should commit, roll back on request, and roll back and rethrow on a failure", async () => {
        const setGoal = (client: { query: Pool["query"] }, id: number) =>
            client.query(
                `UPDATE person SET calorie_goal = 1500 WHERE id = $1`,
                [id],
            );
        const goalOf = async (id: number) => {
            const result = await pool.query<{ calorie_goal: number | null }>(
                `SELECT calorie_goal FROM person WHERE id = $1`,
                [id],
            );

            return result.rows[0].calorie_goal;
        };
        const kept = await createPerson(pool);
        const declined = await createPerson(pool);
        const failed = await createPerson(pool);
        const failure = new Error("halfway");

        await withTransaction(pool, async (client) => {
            await setGoal(client, kept);

            return committed(null);
        });
        await withTransaction(pool, async (client) => {
            await setGoal(client, declined);

            return rolledBack(null);
        });
        await expect(
            withTransaction(pool, async (client) => {
                await setGoal(client, failed);
                throw failure;
            }),
        ).rejects.toBe(failure);

        expect(await goalOf(kept)).toBe(1500);
        expect(await goalOf(declined)).toBeNull();
        expect(await goalOf(failed)).toBeNull();
    });

    it("should report a reachable database, and an unreachable one once its pool is gone", async () => {
        const closedPool = createTestPool();

        await closedPool.end();

        expect(await new PgDatabaseProbe(pool).isReachable()).toBe(true);
        expect(await new PgDatabaseProbe(closedPool).isReachable()).toBe(false);
    });
});
