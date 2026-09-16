import type { Pool } from "pg";

import PgShoppingListRepository from "infrastructure/persistence/pg/PgShoppingListRepository";

import {
    createIngredient,
    createPerson,
    createUnitMeasurement,
} from "./fixtures";
import { createTestPool } from "./testPool";

// targets the per-person transaction: the size limit, position assignment, the reorder set check and the
// merge of an ingredient into an unchecked item - plus the ownership scoping on every write
describe("PgShoppingListRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgShoppingListRepository;
    let unitId: number;

    beforeAll(async () => {
        pool = createTestPool();
        repository = new PgShoppingListRepository(pool);
        unitId = await createUnitMeasurement(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    it("should append items in order and refuse one past the limit", async () => {
        const personId = await createPerson(pool);

        const first = await repository.addItem(
            personId,
            { name: "Milk", note: null },
            2,
        );
        const second = await repository.addItem(
            personId,
            { name: "Bread", note: "wholegrain" },
            2,
        );
        const third = await repository.addItem(
            personId,
            { name: "Eggs", note: null },
            2,
        );
        const items = await repository.findByPerson(personId);

        expect(first?.position).toBe(0);
        expect(second?.position).toBe(1);
        expect(third).toBeNull();
        expect(items.map((item) => item.name)).toEqual(["Milk", "Bread"]);
    });

    it("should update and delete an item only for its owner", async () => {
        const personId = await createPerson(pool);
        const otherPersonId = await createPerson(pool);
        const item = await repository.addItem(
            personId,
            { name: "Milk", note: "2%" },
            10,
        );
        const itemId = item?.id ?? 0;

        const updatedByOther = await repository.updateItem(
            otherPersonId,
            itemId,
            { checked: true },
        );
        const updatedByOwner = await repository.updateItem(personId, itemId, {
            checked: true,
            note: null,
        });
        const deletedByOther = await repository.deleteItem(
            otherPersonId,
            itemId,
        );
        const deletedByOwner = await repository.deleteItem(personId, itemId);

        expect(updatedByOther).toBeNull();
        expect(updatedByOwner).toEqual(
            expect.objectContaining({
                checked: true,
                note: null,
                name: "Milk",
            }),
        );
        expect(deletedByOther).toBe(false);
        expect(deletedByOwner).toBe(true);
    });

    it("should clear only checked items", async () => {
        const personId = await createPerson(pool);
        const bought = await repository.addItem(
            personId,
            { name: "Milk", note: null },
            10,
        );

        await repository.addItem(personId, { name: "Bread", note: null }, 10);
        await repository.updateItem(personId, bought?.id ?? 0, {
            checked: true,
        });
        await repository.deleteChecked(personId);
        const items = await repository.findByPerson(personId);

        expect(items.map((item) => item.name)).toEqual(["Bread"]);
    });

    it("should reorder the full list and reject a stale set of ids", async () => {
        const personId = await createPerson(pool);
        const milk = await repository.addItem(
            personId,
            { name: "Milk", note: null },
            10,
        );
        const bread = await repository.addItem(
            personId,
            { name: "Bread", note: null },
            10,
        );
        const milkId = milk?.id ?? 0;
        const breadId = bread?.id ?? 0;

        const stale = await repository.reorder(personId, [breadId]);
        const reordered = await repository.reorder(personId, [breadId, milkId]);
        const items = await repository.findByPerson(personId);

        expect(stale).toBe(false);
        expect(reordered).toBe(true);
        expect(items.map((item) => item.name)).toEqual(["Bread", "Milk"]);
    });

    it("should merge an ingredient into its unchecked item and add a new one after a checked item", async () => {
        const personId = await createPerson(pool);
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addIngredients(
            personId,
            [{ ingredient_id: ingredientId, quantity: 200 }],
            10,
        );
        await repository.addIngredients(
            personId,
            [{ ingredient_id: ingredientId, quantity: 150 }],
            10,
        );
        const [merged] = await repository.findByPerson(personId);

        await repository.updateItem(personId, merged.id, { checked: true });
        await repository.addIngredients(
            personId,
            [{ ingredient_id: ingredientId, quantity: 50 }],
            10,
        );
        const items = await repository.findByPerson(personId);

        expect(merged).toEqual(
            expect.objectContaining({
                ingredient_id: ingredientId,
                quantity: 200,
            }),
        );
        expect(merged.unit_name).not.toBeNull();
        expect(merged.ingredient_slug).not.toBeNull();
        expect(
            items.map((item) => [item.checked, item.quantity, item.position]),
        ).toEqual([
            [true, 200, 0],
            [false, 50, 1],
        ]);
    });

    it("should add nothing when the new ingredients would overflow the list", async () => {
        const personId = await createPerson(pool);
        const firstId = await createIngredient(pool, unitId);
        const secondId = await createIngredient(pool, unitId);

        await repository.addItem(personId, { name: "Milk", note: null }, 2);
        const added = await repository.addIngredients(
            personId,
            [
                { ingredient_id: firstId, quantity: 1 },
                { ingredient_id: secondId, quantity: 1 },
            ],
            2,
        );
        const items = await repository.findByPerson(personId);

        expect(added).toBe(false);
        expect(items).toHaveLength(1);
    });

    it("should remove the list with its owner's account", async () => {
        const personId = await createPerson(pool);

        await repository.addItem(personId, { name: "Milk", note: null }, 10);
        await pool.query(`DELETE FROM person WHERE id = $1`, [personId]);
        const items = await repository.findByPerson(personId);

        expect(items).toEqual([]);
    });
});
