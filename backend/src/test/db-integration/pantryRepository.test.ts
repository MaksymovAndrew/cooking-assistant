import type { Pool } from "pg";

import PgPantryRepository from "infrastructure/persistence/pg/PgPantryRepository";

import {
    createIngredient,
    createPerson,
    createUnitMeasurement,
} from "./fixtures";
import { createTestPool } from "./testPool";

interface PantryRow {
    ingredient_id: number;
    quantity_person_ingradient: number;
}

interface PurchaseRow {
    id: number;
    quantity: number;
}

// targets the misspelled `quantity_person_ingradient` column and the purchase-delta math in PgPantryRepository.queries.ts - invisible to mocked-repository unit tests
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

    it("should record a pantry row and a matching purchase-history row on first purchase", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 3 },
        ]);

        const pantry = (await repository.findByUser(userId)) as PantryRow[];
        const history = (await repository.findPurchaseHistory(
            userId,
            ingredientId,
        )) as PurchaseRow[];

        expect(
            pantry.find((row) => row.ingredient_id === ingredientId)
                ?.quantity_person_ingradient,
        ).toBe(3);
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

        const pantry = (await repository.findByUser(userId)) as PantryRow[];
        const history = (await repository.findPurchaseHistory(
            userId,
            ingredientId,
        )) as PurchaseRow[];

        expect(
            pantry.find((row) => row.ingredient_id === ingredientId)
                ?.quantity_person_ingradient,
        ).toBe(7);
        expect(history).toHaveLength(2);
    });

    it("should log only the delta (not the new total) when updateQuantities increases stock", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 4 },
        ]);
        await repository.updateQuantities(userId, [
            { id: ingredientId, quantity_person_ingradient: 10 },
        ]);

        const history = (await repository.findPurchaseHistory(
            userId,
            ingredientId,
        )) as PurchaseRow[];
        const totalLogged = history.reduce((sum, row) => sum + row.quantity, 0);

        expect(totalLogged).toBe(10);
        expect(history).toHaveLength(2);
    });

    it("should delete both the pantry row and its purchase history when updateQuantities drops stock to zero", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 6 },
        ]);
        await repository.updateQuantities(userId, [
            { id: ingredientId, quantity_person_ingradient: 0 },
        ]);

        const pantry = (await repository.findByUser(userId)) as PantryRow[];
        const history = await repository.findPurchaseHistory(
            userId,
            ingredientId,
        );

        expect(
            pantry.find((row) => row.ingredient_id === ingredientId),
        ).toBeUndefined();
        expect(history).toHaveLength(0);
    });

    it("should apply a purchase edit as a delta on pantry stock, floored at zero", async () => {
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(userId, [
            { id: ingredientId, quantity_person_ingradient: 5 },
        ]);
        const history = (await repository.findPurchaseHistory(
            userId,
            ingredientId,
        )) as PurchaseRow[];
        const purchaseId = history[0].id;

        // consumption elsewhere: stock drops to 1, purchase history untouched
        await repository.updateQuantities(userId, [
            { id: ingredientId, quantity_person_ingradient: 1 },
        ]);

        // correcting the purchase to 0 is a -5 delta, but only 1 unit is left - must floor at 0
        const updated = await repository.updatePurchaseQuantity(
            userId,
            purchaseId,
            0,
        );
        const pantryAfterCorrection = (await repository.findByUser(
            userId,
        )) as PantryRow[];

        expect(updated).toBe(true);
        expect(
            pantryAfterCorrection.find(
                (row) => row.ingredient_id === ingredientId,
            )?.quantity_person_ingradient,
        ).toBe(0);
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
});
