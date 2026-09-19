import type { Pool } from "pg";

import type {
    ShoppingListAddItemResult,
    ShoppingListAddOutcome,
    ShoppingListIngredientInput,
    ShoppingListItemInput,
    ShoppingListItemRow,
} from "domain/repositories/ShoppingListRepository";

import { inPersonWriteTransaction } from "./personWriteTransaction";
import { readTotals } from "./PgShoppingListRepository.lock";

export function addItem(
    pool: Pool,
    personId: number,
    item: ShoppingListItemInput,
    maxItems: number,
): Promise<ShoppingListAddItemResult> {
    const missingPerson: ShoppingListAddItemResult = {
        outcome: "person_not_found",
        item: null,
    };

    return inPersonWriteTransaction<ShoppingListAddItemResult>(
        pool,
        personId,
        missingPerson,
        async (client) => {
            const { total, last_position } = await readTotals(client, personId);

            if (total >= maxItems) {
                return {
                    commit: false,
                    result: { outcome: "limit_reached", item: null },
                };
            }

            const inserted = await client.query<ShoppingListItemRow>(
                `INSERT INTO shopping_list_items (person_id, name, note, position)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, note, ingredient_id, NULL::text AS ingredient_slug,
                       NULL::text AS unit_name, quantity, checked, position`,
                [personId, item.name, item.note, last_position + 1],
            );

            return {
                commit: true,
                result: { outcome: "added", item: inserted.rows[0] },
            };
        },
    );
}

export function reorder(
    pool: Pool,
    personId: number,
    ids: number[],
): Promise<boolean> {
    // a missing person has no items, so the stale-list check would refuse the order anyway
    return inPersonWriteTransaction(pool, personId, false, async (client) => {
        const current = await client.query<{ id: number }>(
            `SELECT id FROM shopping_list_items WHERE person_id = $1`,
            [personId],
        );
        const currentIds = new Set(current.rows.map((row) => row.id));
        const matchesCurrentList =
            ids.length === currentIds.size &&
            ids.every((id) => currentIds.has(id));

        if (!matchesCurrentList) {
            return { commit: false, result: false };
        }

        await client.query(
            `UPDATE shopping_list_items s
             SET position = input.ord - 1
             FROM unnest($2::int[]) WITH ORDINALITY AS input(id, ord)
             WHERE s.id = input.id AND s.person_id = $1`,
            [personId, ids],
        );

        return { commit: true, result: true };
    });
}

export function addIngredients(
    pool: Pool,
    personId: number,
    items: ShoppingListIngredientInput[],
    maxItems: number,
): Promise<ShoppingListAddOutcome> {
    return inPersonWriteTransaction<ShoppingListAddOutcome>(
        pool,
        personId,
        "person_not_found",
        async (client) => {
            const merged = await client.query<{ ingredient_id: number }>(
                // unticking a bought item can leave two unchecked rows of one ingredient; only the first takes the amount
                `UPDATE shopping_list_items s
             SET quantity = COALESCE(s.quantity + input.quantity, s.quantity, input.quantity)
             FROM unnest($2::int[], $3::float8[]) AS input(ingredient_id, quantity)
             WHERE s.id = (
                 SELECT t.id FROM shopping_list_items t
                 WHERE t.person_id = $1 AND t.ingredient_id = input.ingredient_id AND NOT t.checked
                 ORDER BY t.position, t.id
                 LIMIT 1
             )
             RETURNING s.ingredient_id`,
                [
                    personId,
                    items.map((item) => item.ingredient_id),
                    items.map((item) => item.quantity),
                ],
            );
            const mergedIds = new Set(
                merged.rows.map((row) => row.ingredient_id),
            );
            const newItems = items.filter(
                (item) => !mergedIds.has(item.ingredient_id),
            );
            const { total, last_position } = await readTotals(client, personId);

            if (total + newItems.length > maxItems) {
                return { commit: false, result: "limit_reached" };
            }

            await client.query(
                `INSERT INTO shopping_list_items (person_id, name, ingredient_id, quantity, position)
             SELECT $1, i.name, input.ingredient_id, input.quantity, $4 + input.ord
             FROM unnest($2::int[], $3::float8[]) WITH ORDINALITY AS input(ingredient_id, quantity, ord)
             JOIN ingredients i ON i.id = input.ingredient_id
             ORDER BY input.ord`,
                [
                    personId,
                    newItems.map((item) => item.ingredient_id),
                    newItems.map((item) => item.quantity),
                    last_position,
                ],
            );

            return { commit: true, result: "added" };
        },
    );
}
