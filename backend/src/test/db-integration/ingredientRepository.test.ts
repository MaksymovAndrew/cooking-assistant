import { randomUUID } from "node:crypto";
import type { Pool } from "pg";

import PgIngredientRepository from "infrastructure/persistence/pg/PgIngredientRepository";

import { createIngredient, createUnitMeasurement } from "./fixtures";
import { createTestPool } from "./testPool";

describe("PgIngredientRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgIngredientRepository;
    let unitId: number;

    beforeAll(async () => {
        pool = createTestPool();
        repository = new PgIngredientRepository(pool);
        unitId = await createUnitMeasurement(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    it("should list a catalog ingredient with its unit and allergens", async () => {
        const ingredientId = await createIngredient(pool, unitId, ["milk"], 42);

        const row = (await repository.findAll()).find(
            (ingredient) => ingredient.id === ingredientId,
        );

        expect(row).toEqual(
            expect.objectContaining({
                category: "test_category",
                allergens: ["milk"],
                calories_per_unit: 42,
            }),
        );
        expect(row?.unit_name).toMatch(/^unit-/);
    });

    // the libc locale of the alpine image would put "Zupa" before "apple" and Ukrainian "і" after "я"
    it("should sort names the way a reader expects in every language", async () => {
        const suffix = randomUUID();
        const names = ["żurek", "Zupa", "яблоко", "banana", "інжир", "apple"];

        for (const name of names) {
            await pool.query(
                `INSERT INTO ingredients (name, slug, category, id_unit_measurement)
                 VALUES ($1, $2, 'test_category', $3)`,
                [`${name} ${suffix}`, `${name}-${suffix}`, unitId],
            );
        }

        const sorted = (await repository.findAll())
            .filter((row) => row.name.endsWith(suffix))
            .map((row) => row.name.replace(` ${suffix}`, ""));

        expect(sorted).toEqual([
            "apple",
            "banana",
            "Zupa",
            "żurek",
            "інжир",
            "яблоко",
        ]);
    });

    it("should return only the ids that exist", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        expect(
            await repository.findExistingIds([
                ingredientId,
                ingredientId + 1_000_000,
            ]),
        ).toEqual([ingredientId]);
    });
});
