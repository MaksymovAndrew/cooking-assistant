import type { Pool } from "pg";

import type {
    CookInput,
    CookOutcome,
} from "domain/repositories/PantryConsumptionRepository";

import PgPantryConsumptionRepository from "infrastructure/persistence/pg/PgPantryConsumptionRepository";

import {
    createIngredient,
    createMenu,
    createMenuCategory,
    createPerson,
    createRecipe,
    createUnitMeasurement,
} from "./fixtures";
import { createTestPool } from "./testPool";

const UNDO_WINDOW_MS = 60_000;
const JANUARY = "2026-01-01T00:00:00";
const FEBRUARY = "2026-02-01T00:00:00";
const MARCH = "2026-03-01T00:00:00";

interface LotRow {
    id: number;
    quantity: number;
    purchase_date: Date;
}

// targets the FIFO lot arithmetic, the lot snapshot that lets undo recreate a used-up lot, and the
// calorie entry written in the same transaction - none of it is visible to mocked unit tests
describe("PgPantryConsumptionRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgPantryConsumptionRepository;
    let unitId: number;
    let categoryId: number;

    beforeAll(async () => {
        pool = createTestPool();
        repository = new PgPantryConsumptionRepository(pool);
        unitId = await createUnitMeasurement(pool);
        categoryId = await createMenuCategory(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    async function stock(
        personId: number,
        ingredientId: number,
        lots: { quantity: number; date: string }[],
    ): Promise<number[]> {
        const total = lots.reduce((sum, lot) => sum + lot.quantity, 0);

        await pool.query(
            `INSERT INTO person_ingredients (person_id, ingredient_id, quantity_person_ingradient)
             VALUES ($1, $2, $3)`,
            [personId, ingredientId, total],
        );

        const ids: number[] = [];

        for (const { quantity, date } of lots) {
            const result = await pool.query<{ id: number }>(
                `INSERT INTO ingredient_purchases (person_id, ingredient_id, quantity, purchase_date)
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [personId, ingredientId, quantity, date],
            );

            ids.push(result.rows[0].id);
        }

        return ids;
    }

    async function lotsOf(personId: number, ingredientId: number) {
        const result = await pool.query<LotRow>(
            `SELECT id, quantity, purchase_date FROM ingredient_purchases
             WHERE person_id = $1 AND ingredient_id = $2 ORDER BY id`,
            [personId, ingredientId],
        );

        return result.rows;
    }

    async function stockOf(personId: number, ingredientId: number) {
        const result = await pool.query<{ quantity: number }>(
            `SELECT quantity_person_ingradient AS quantity FROM person_ingredients
             WHERE person_id = $1 AND ingredient_id = $2`,
            [personId, ingredientId],
        );

        return result.rows[0]?.quantity ?? null;
    }

    async function cooked(
        personId: number,
        input: CookInput,
    ): Promise<CookOutcome> {
        const result = await repository.cook(personId, input);

        if (result === "person_not_found") {
            throw new Error("the person exists");
        }

        return result;
    }

    function cookInput(
        recipeId: number,
        needs: CookInput["needs"],
        calorieEntry: CookInput["calorieEntry"] = null,
    ): CookInput {
        return {
            source: { recipeId },
            title: "Pancakes",
            portions: 1,
            needs,
            calorieEntry,
        };
    }

    it("should read a recipe's ingredients and sum a menu's recipes per ingredient", async () => {
        const personId = await createPerson(pool);
        const flour = await createIngredient(pool, unitId);
        const eggs = await createIngredient(pool, unitId);
        const pancakes = await createRecipe(pool, personId, [
            { ingredientId: flour, quantity: 200 },
            { ingredientId: eggs, quantity: 2 },
        ]);
        const bread = await createRecipe(pool, personId, [
            { ingredientId: flour, quantity: 500 },
        ]);
        const menuId = await createMenu(pool, personId, categoryId, [
            pancakes,
            bread,
        ]);

        const recipeNeeds = await repository.findRequirements({
            recipeId: pancakes,
        });
        const menuNeeds = await repository.findRequirements({ menuId });
        const quantities = (rows: typeof menuNeeds) =>
            Object.fromEntries(
                rows.map((row) => [row.ingredient_id, row.quantity]),
            );

        expect(quantities(recipeNeeds)).toEqual({ [flour]: 200, [eggs]: 2 });
        expect(quantities(menuNeeds)).toEqual({ [flour]: 700, [eggs]: 2 });
    });

    it("should use the oldest lot first, delete a lot it empties and lower the stock", async () => {
        const personId = await createPerson(pool);
        const flour = await createIngredient(pool, unitId);
        const recipeId = await createRecipe(pool, personId, []);
        const [, older, newer] = await stock(personId, flour, [
            { quantity: 0.5, date: MARCH },
            { quantity: 2, date: JANUARY },
            { quantity: 3, date: FEBRUARY },
        ]);

        const result = await repository.cook(
            personId,
            cookInput(recipeId, [{ ingredient_id: flour, quantity: 3 }]),
        );

        expect(result).toEqual(
            expect.objectContaining({
                taken: [{ ingredient_id: flour, quantity: 3 }],
                calorieIntake: null,
            }),
        );
        const lots = await lotsOf(personId, flour);

        expect(lots.map((lot) => lot.id)).not.toContain(older);
        expect(lots.find((lot) => lot.id === newer)?.quantity).toBe(2);
        expect(await stockOf(personId, flour)).toBe(2.5);
    });

    it("should take what the pantry has, skip what it lacks and drop a used-up ingredient", async () => {
        const personId = await createPerson(pool);
        const milk = await createIngredient(pool, unitId);
        const salt = await createIngredient(pool, unitId);
        const recipeId = await createRecipe(pool, personId, []);

        await stock(personId, milk, [{ quantity: 0.4, date: JANUARY }]);

        const result = await repository.cook(
            personId,
            cookInput(recipeId, [
                { ingredient_id: milk, quantity: 1 },
                { ingredient_id: salt, quantity: 0.01 },
            ]),
        );

        expect(result).toEqual(
            expect.objectContaining({
                taken: [{ ingredient_id: milk, quantity: 0.4 }],
            }),
        );
        expect(await lotsOf(personId, milk)).toEqual([]);
        expect(await stockOf(personId, milk)).toBeNull();
    });

    it("should record a cooking even when nothing was in the pantry", async () => {
        const personId = await createPerson(pool);
        const salt = await createIngredient(pool, unitId);
        const recipeId = await createRecipe(pool, personId, []);

        const result = await repository.cook(
            personId,
            cookInput(recipeId, [{ ingredient_id: salt, quantity: 1 }]),
        );

        expect(result).toEqual(expect.objectContaining({ taken: [] }));
    });

    it("should log the calories in the same transaction and remove them on undo", async () => {
        const personId = await createPerson(pool);
        const recipeId = await createRecipe(pool, personId, []);

        const result = await cooked(
            personId,
            cookInput(recipeId, [], {
                recipe_id: recipeId,
                title: "Pancakes",
                portions: 2,
                calories: 620,
            }),
        );

        expect(result.calorieIntake).toEqual(
            expect.objectContaining({
                person_id: personId,
                recipe_id: recipeId,
                calories: 620,
            }),
        );

        await repository.undo(personId, result.consumptionId, UNDO_WINDOW_MS);
        const intake = await pool.query(
            `SELECT 1 FROM calorie_intake WHERE id = $1`,
            [result.calorieIntake?.id],
        );

        expect(intake.rowCount).toBe(0);
    });

    it("should bring a used-up lot back under its own id and date, and top up one still there", async () => {
        const personId = await createPerson(pool);
        const flour = await createIngredient(pool, unitId);
        const recipeId = await createRecipe(pool, personId, []);
        const [first, second] = await stock(personId, flour, [
            { quantity: 1, date: JANUARY },
            { quantity: 4, date: FEBRUARY },
        ]);
        const before = await lotsOf(personId, flour);
        const result = await cooked(
            personId,
            cookInput(recipeId, [{ ingredient_id: flour, quantity: 2 }]),
        );

        const outcome = await repository.undo(
            personId,
            result.consumptionId,
            UNDO_WINDOW_MS,
        );

        expect(outcome).toBe("undone");
        expect(await lotsOf(personId, flour)).toEqual(before);
        expect(before.map((lot) => lot.id)).toEqual([first, second]);
        expect(await stockOf(personId, flour)).toBe(5);
    });

    it("should restore an ingredient the cooking removed from the pantry", async () => {
        const personId = await createPerson(pool);
        const milk = await createIngredient(pool, unitId);
        const recipeId = await createRecipe(pool, personId, []);

        await stock(personId, milk, [{ quantity: 1, date: JANUARY }]);
        const result = await cooked(
            personId,
            cookInput(recipeId, [{ ingredient_id: milk, quantity: 1 }]),
        );

        await repository.undo(personId, result.consumptionId, UNDO_WINDOW_MS);

        expect(await stockOf(personId, milk)).toBe(1);
    });

    it("should undo only once, only inside the window and only for its owner", async () => {
        const personId = await createPerson(pool);
        const strangerId = await createPerson(pool);
        const recipeId = await createRecipe(pool, personId, []);
        const first = await cooked(personId, cookInput(recipeId, []));
        const second = await cooked(personId, cookInput(recipeId, []));

        expect(
            await repository.undo(
                strangerId,
                first.consumptionId,
                UNDO_WINDOW_MS,
            ),
        ).toBe("not_found");
        expect(
            await repository.undo(
                personId,
                first.consumptionId,
                UNDO_WINDOW_MS,
            ),
        ).toBe("undone");
        expect(
            await repository.undo(
                personId,
                first.consumptionId,
                UNDO_WINDOW_MS,
            ),
        ).toBe("unavailable");
        expect(await repository.undo(personId, second.consumptionId, 0)).toBe(
            "unavailable",
        );
    });

    it("should report a missing person instead of writing anything", async () => {
        const personId = await createPerson(pool);
        const recipeId = await createRecipe(pool, personId, []);

        await pool.query(`DELETE FROM person WHERE id = $1`, [personId]);

        expect(await repository.cook(personId, cookInput(recipeId, []))).toBe(
            "person_not_found",
        );
    });
});
