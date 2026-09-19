import type { Pool } from "pg";

import type {
    ShoppingListAddItemResult,
    ShoppingListAddOutcome,
    ShoppingListIngredientInput,
    ShoppingListItemChanges,
    ShoppingListItemInput,
    ShoppingListItemRow,
    ShoppingListRepository,
} from "domain/repositories/ShoppingListRepository";

import {
    addIngredients,
    addItem,
    reorder,
} from "./PgShoppingListRepository.transactions";

const ITEM_COLUMNS = `s.id, s.name, s.note, s.ingredient_id, i.slug AS ingredient_slug, um.unit_name,
       s.quantity, s.checked, s.position`;

const ITEM_JOINS = `LEFT JOIN ingredients i ON i.id = s.ingredient_id
     LEFT JOIN unit_measurement um ON um.id = i.id_unit_measurement`;

export default class PgShoppingListRepository implements ShoppingListRepository {
    constructor(private pool: Pool) {}

    async findByPerson(personId: number): Promise<ShoppingListItemRow[]> {
        const result = await this.pool.query<ShoppingListItemRow>(
            `SELECT ${ITEM_COLUMNS}
             FROM shopping_list_items s
             ${ITEM_JOINS}
             WHERE s.person_id = $1
             ORDER BY s.position, s.id`,
            [personId],
        );

        return result.rows;
    }

    addItem(
        personId: number,
        item: ShoppingListItemInput,
        maxItems: number,
    ): Promise<ShoppingListAddItemResult> {
        return addItem(this.pool, personId, item, maxItems);
    }

    async updateItem(
        personId: number,
        itemId: number,
        changes: ShoppingListItemChanges,
    ): Promise<ShoppingListItemRow | null> {
        const values: unknown[] = [itemId, personId];
        const assignments: string[] = [];
        const bind = (value: unknown): string => {
            values.push(value);

            return `$${values.length}`;
        };

        if (typeof changes.note !== "undefined") {
            assignments.push(`note = ${bind(changes.note)}`);
        }
        if (typeof changes.checked === "boolean") {
            assignments.push(`checked = ${bind(changes.checked)}`);
        }

        const result = await this.pool.query<ShoppingListItemRow>(
            `WITH s AS (
                 UPDATE shopping_list_items
                 SET ${assignments.join(", ")}
                 WHERE id = $1 AND person_id = $2
                 RETURNING *
             )
             SELECT ${ITEM_COLUMNS}
             FROM s
             ${ITEM_JOINS}`,
            values,
        );

        return result.rows[0] ?? null;
    }

    async deleteItem(personId: number, itemId: number): Promise<boolean> {
        const result = await this.pool.query(
            `DELETE FROM shopping_list_items WHERE id = $1 AND person_id = $2`,
            [itemId, personId],
        );

        return (result.rowCount ?? 0) > 0;
    }

    async deleteChecked(personId: number): Promise<void> {
        await this.pool.query(
            `DELETE FROM shopping_list_items WHERE person_id = $1 AND checked`,
            [personId],
        );
    }

    reorder(personId: number, ids: number[]): Promise<boolean> {
        return reorder(this.pool, personId, ids);
    }

    addIngredients(
        personId: number,
        items: ShoppingListIngredientInput[],
        maxItems: number,
    ): Promise<ShoppingListAddOutcome> {
        return addIngredients(this.pool, personId, items, maxItems);
    }
}
