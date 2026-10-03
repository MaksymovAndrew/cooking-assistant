import type { Pool, PoolClient } from "pg";

import { inPersonWriteTransaction } from "./personWriteTransaction";
import { committed, rolledBack } from "./transaction";

interface PurchaseRow {
    quantity: number;
    ingredient_id: number;
}

export function updatePurchaseQuantity(
    pool: Pool,
    userId: number,
    purchaseId: number,
    quantity: number,
): Promise<boolean> {
    return inPersonWriteTransaction(pool, userId, false, async (client) => {
        const purchase = await client.query<PurchaseRow>(
            `SELECT quantity, ingredient_id FROM ingredient_purchases WHERE id = $1 AND person_id = $2 FOR UPDATE`,
            [purchaseId, userId],
        );

        if (purchase.rows.length === 0) {
            return rolledBack(false);
        }

        // a delta, not a SUM of purchases, so stock already consumed stays consumed
        const { quantity: oldQuantity, ingredient_id: ingredientId } =
            purchase.rows[0];
        const delta = quantity - oldQuantity;

        await client.query(
            `UPDATE ingredient_purchases SET quantity = $1 WHERE id = $2`,
            [quantity, purchaseId],
        );

        await client.query(
            `UPDATE person_ingredients
       SET quantity_person_ingradient = GREATEST(quantity_person_ingradient + $1, 0)
       WHERE person_id = $2 AND ingredient_id = $3`,
            [delta, userId, ingredientId],
        );

        return committed(true);
    });
}

async function removeEmptiedRows(
    client: PoolClient,
    userId: number,
    ingredientIds: number[],
): Promise<void> {
    await client.query(
        `DELETE FROM person_ingredients pi
       WHERE pi.person_id = $1 AND pi.ingredient_id = ANY($2::int[])
         AND NOT EXISTS (
           SELECT 1 FROM ingredient_purchases ip
           WHERE ip.person_id = pi.person_id AND ip.ingredient_id = pi.ingredient_id
         )`,
        [userId, ingredientIds],
    );
}

// an ingredient's last lot takes its pantry row along, like deleting the item
export function deletePurchases(
    pool: Pool,
    userId: number,
    purchaseIds: number[],
): Promise<number> {
    return inPersonWriteTransaction(pool, userId, 0, async (client) => {
        const deleted = await client.query<PurchaseRow>(
            `DELETE FROM ingredient_purchases WHERE id = ANY($1::int[]) AND person_id = $2
       RETURNING quantity, ingredient_id`,
            [purchaseIds, userId],
        );
        const ingredientIds = deleted.rows.map((row) => row.ingredient_id);

        await removeEmptiedRows(client, userId, ingredientIds);
        await client.query(
            `UPDATE person_ingredients pi
       SET quantity_person_ingradient = GREATEST(pi.quantity_person_ingradient - gone.total, 0)
       FROM (
         SELECT ingredient_id, SUM(quantity) AS total
         FROM unnest($2::int[], $3::float8[]) AS lot(ingredient_id, quantity)
         GROUP BY ingredient_id
       ) gone
       WHERE pi.person_id = $1 AND pi.ingredient_id = gone.ingredient_id`,
            [userId, ingredientIds, deleted.rows.map((row) => row.quantity)],
        );

        return committed(deleted.rows.length);
    });
}
