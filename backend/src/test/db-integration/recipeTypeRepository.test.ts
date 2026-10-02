import type { Pool } from "pg";

import PgRecipeTypeRepository from "infrastructure/persistence/pg/PgRecipeTypeRepository";

import { createRecipeType } from "./fixtures";
import { createTestPool } from "./testPool";

describe("PgRecipeTypeRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgRecipeTypeRepository;

    beforeAll(() => {
        pool = createTestPool();
        repository = new PgRecipeTypeRepository(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    it("should return inserted recipe types", async () => {
        const typeId = await createRecipeType(pool);

        const all = await repository.findAll();

        expect(all).toEqual(
            expect.arrayContaining([expect.objectContaining({ id: typeId })]),
        );
    });

    it("should tell an existing recipe type from a missing one", async () => {
        const typeId = await createRecipeType(pool);

        expect(await repository.exists(typeId)).toBe(true);
        expect(await repository.exists(typeId + 1_000_000)).toBe(false);
    });
});
