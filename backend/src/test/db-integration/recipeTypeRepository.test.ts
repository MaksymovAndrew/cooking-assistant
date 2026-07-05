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

        const all = (await repository.findAll()) as {
            id: number;
            type_name: string;
        }[];

        expect(all).toEqual(
            expect.arrayContaining([expect.objectContaining({ id: typeId })]),
        );
    });
});
