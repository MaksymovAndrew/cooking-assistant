import { randomUUID } from "node:crypto";
import type { Pool } from "pg";

import PgMenuCategoryRepository from "infrastructure/persistence/pg/PgMenuCategoryRepository";

import { createMenuCategory } from "./fixtures";
import { createTestPool } from "./testPool";

interface MenuCategoryRow {
    menu_category_id: number;
    category_name: string;
}

describe("PgMenuCategoryRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgMenuCategoryRepository;

    beforeAll(() => {
        pool = createTestPool();
        repository = new PgMenuCategoryRepository(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    it("should return categories with their id and name", async () => {
        const categoryId = await createMenuCategory(pool);

        const all = (await repository.findAll()) as MenuCategoryRow[];

        expect(all).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ menu_category_id: categoryId }),
            ]),
        );
    });

    it("should order categories by name", async () => {
        const firstName = `aaa-${randomUUID()}`;
        const lastName = `zzz-${randomUUID()}`;

        await pool.query(
            `INSERT INTO menu_category (category_name) VALUES ($1), ($2)`,
            [lastName, firstName],
        );

        const all = (await repository.findAll()) as MenuCategoryRow[];
        const firstIndex = all.findIndex(
            (row) => row.category_name === firstName,
        );
        const lastIndex = all.findIndex(
            (row) => row.category_name === lastName,
        );

        expect(firstIndex).toBeGreaterThanOrEqual(0);
        expect(lastIndex).toBeGreaterThanOrEqual(0);
        expect(firstIndex).toBeLessThan(lastIndex);
    });
});
