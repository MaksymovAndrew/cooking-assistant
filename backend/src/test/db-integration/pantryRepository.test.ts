import type { Pool } from "pg";

import PgPantryRepository from "infrastructure/persistence/pg/PgPantryRepository";

import {
    createIngredient,
    createPerson,
    createUnitMeasurement,
} from "./fixtures";
import { createTestPool } from "./testPool";

// targets the misspelled `quantity_person_ingradient` column and the purchase-lot aggregation in
// PgPantryRepository.queries.ts - invisible to mocked-repository unit tests
describe("PgPantryRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgPantryRepository;
    let userId: number;
    let unitId: number;

    beforeAll(async () => {
        pool = createTestPool();
        repository = new PgPantryRepository(pool);
        userId = await createPerson(pool);
        unitId = await createUnitMeasurement(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    const findPantryRow = async (ingredientId: number) => {
        const pantry = await repository.findByUser(userId);

        return pantry.find((row) => row.ingredient_id === ingredientId);
    };

    it("should record a pantry row and a matching purchase-history row on first purchase", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 3 },
        ]);

        const pantryRow = await findPantryRow(ingredientId);
        const history = await repository.findPurchaseHistory(
            userId,
            ingredientId,
        );

        expect(pantryRow?.quantity_person_ingradient).toBe(3);
        expect(history).toHaveLength(1);
        expect(history[0].quantity).toBe(3);
    });

    it("should add to the existing quantity rather than overwrite it on a repeat purchase", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 2 },
        ]);
        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 5 },
        ]);

        const pantryRow = await findPantryRow(ingredientId);
        const history = await repository.findPurchaseHistory(
            userId,
            ingredientId,
        );

        expect(pantryRow?.quantity_person_ingradient).toBe(7);
        expect(history).toHaveLength(2);
    });

    it("should surface every lot with its own purchase date and quantity, oldest first", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await pool.query(
            `INSERT INTO ingredient_purchases (person_id, ingredient_id, quantity, purchase_date)
             VALUES ($1, $2, 2, '2026-01-01T00:00:00Z')`,
            [userId, ingredientId],
        );
        await pool.query(
            `INSERT INTO ingredient_purchases (person_id, ingredient_id, quantity, purchase_date)
             VALUES ($1, $2, 4, '2026-02-01T00:00:00Z')`,
            [userId, ingredientId],
        );
        await pool.query(
            `INSERT INTO person_ingredients (person_id, ingredient_id, quantity_person_ingradient, purchase_date)
             VALUES ($1, $2, 6, '2026-02-01T00:00:00Z')`,
            [userId, ingredientId],
        );

        const pantryRow = await findPantryRow(ingredientId);

        // ordering (not exact clock time) is what the feature depends on - `purchase_date` is a
        // tz-naive column, so the driver round-trips it through the test runner's local zone
        expect(pantryRow?.lots).toEqual([
            expect.objectContaining({ quantity: 2 }),
            expect.objectContaining({ quantity: 4 }),
        ]);
    });

    it("should report the oldest lot's date, not the most recently topped-up date, as purchase_date", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        // an old lot, bought years before "today" - far from any day/year boundary so a
        // timezone round-trip through the tz-naive column can't shift it into a different year
        await pool.query(
            `INSERT INTO ingredient_purchases (person_id, ingredient_id, quantity, purchase_date)
             VALUES ($1, $2, 1, '2020-06-15T12:00:00Z')`,
            [userId, ingredientId],
        );
        await pool.query(
            `INSERT INTO person_ingredients (person_id, ingredient_id, quantity_person_ingradient, purchase_date)
             VALUES ($1, $2, 1, '2020-06-15T12:00:00Z')`,
            [userId, ingredientId],
        );

        // topping up today must not "refresh" the old lot's expiry
        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 1 },
        ]);

        const pantryRow = await findPantryRow(ingredientId);

        expect(new Date(pantryRow?.purchase_date ?? 0).getFullYear()).toBe(
            2020,
        );
        expect(pantryRow?.lots).toHaveLength(2);
    });

    it("should apply a purchase edit as a delta on pantry stock, floored at zero", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 5 },
        ]);
        const history = await repository.findPurchaseHistory(
            userId,
            ingredientId,
        );
        const purchaseId = history[0].id;

        // consumption elsewhere (no in-app flow for this yet): stock drops to 1 out of band,
        // purchase history untouched
        await pool.query(
            `UPDATE person_ingredients SET quantity_person_ingradient = 1
             WHERE person_id = $1 AND ingredient_id = $2`,
            [userId, ingredientId],
        );

        // correcting the purchase to 1 is a -4 delta, but only 1 unit is left - must floor at 0
        const updated = await repository.updatePurchaseQuantity(
            userId,
            purchaseId,
            1,
        );
        const pantryRow = await findPantryRow(ingredientId);

        expect(updated).toBe(true);
        expect(pantryRow?.quantity_person_ingradient).toBe(0);
    });

    it("should delete an ingredient's pantry and purchase rows, and report false when it did not exist", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 2 },
        ]);

        const deleted = await repository.deleteIngredient(userId, ingredientId);
        const deletedAgain = await repository.deleteIngredient(
            userId,
            ingredientId,
        );

        expect(deleted).toBe(true);
        expect(deletedAgain).toBe(false);

        const history = await repository.findPurchaseHistory(
            userId,
            ingredientId,
        );

        expect(history).toHaveLength(0);
    });

    it("should take a deleted lot out of the stock and keep the other lots", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 5 },
        ]);
        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 2 },
        ]);
        const history = await repository.findPurchaseHistory(
            userId,
            ingredientId,
        );

        const deleted = await repository.deletePurchases(userId, [
            history[0].id,
        ]);
        const pantryRow = await findPantryRow(ingredientId);

        expect(deleted).toBe(1);
        expect(pantryRow?.quantity_person_ingradient).toBe(2);
        expect(pantryRow?.lots).toHaveLength(1);
    });

    it("should remove the pantry item with its last lot", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 3 },
        ]);
        const history = await repository.findPurchaseHistory(
            userId,
            ingredientId,
        );

        await repository.deletePurchases(userId, [history[0].id]);

        expect(await findPantryRow(ingredientId)).toBeUndefined();
    });

    it("should not delete another person's purchase", async () => {
        const ingredientId = await createIngredient(pool, unitId);
        const otherUserId = await createPerson(pool);

        await repository.addIngredients(otherUserId, [
            { id: ingredientId, quantity_person_ingradient: 3 },
        ]);
        const history = await repository.findPurchaseHistory(
            otherUserId,
            ingredientId,
        );

        const deleted = await repository.deletePurchases(userId, [
            history[0].id,
        ]);

        expect(deleted).toBe(0);
        expect(
            await repository.findPurchaseHistory(otherUserId, ingredientId),
        ).toHaveLength(1);
    });

    it("should discard lots of several ingredients in one go", async () => {
        const kept = await createIngredient(pool, unitId);
        const emptied = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: kept, quantity_person_ingradient: 4 },
            { id: emptied, quantity_person_ingradient: 1 },
        ]);
        await repository.addIngredients(userId, [
            { id: kept, quantity_person_ingradient: 3 },
        ]);
        const keptHistory = await repository.findPurchaseHistory(userId, kept);
        const emptiedHistory = await repository.findPurchaseHistory(
            userId,
            emptied,
        );

        const discarded = await repository.deletePurchases(userId, [
            keptHistory[0].id,
            emptiedHistory[0].id,
        ]);

        expect(discarded).toBe(2);
        expect((await findPantryRow(kept))?.quantity_person_ingradient).toBe(3);
        expect(await findPantryRow(emptied)).toBeUndefined();
    });

    it("should hand each lot its purchase id", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 2 },
        ]);
        const history = await repository.findPurchaseHistory(
            userId,
            ingredientId,
        );

        expect((await findPantryRow(ingredientId))?.lots).toEqual([
            expect.objectContaining({ id: history[0].id, quantity: 2 }),
        ]);
    });
});
