import type { Pool } from "pg";

import type {
    ShoppingListAddItemResult,
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
