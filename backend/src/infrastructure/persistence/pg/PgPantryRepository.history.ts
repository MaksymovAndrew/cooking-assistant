import type { Pool } from "pg";

interface PurchaseHistoryRow {
    id: number;
    quantity: number;
    purchase_date: Date;
    unit_name: string;
    days_to_expire: number | null;
}

export async function findIngredientPurchaseHistory(
    pool: Pool,
    userId: string | number,
    ingredientId: string | number,
): Promise<unknown[]> {
    const result = await pool.query<PurchaseHistoryRow>(
        `SELECT
                     ip.id,
                     ip.quantity,
                     ip.purchase_date,
                     um.unit_name,
                     i.days_to_expire
                 FROM ingredient_purchases ip
                          JOIN ingredients i ON ip.ingredient_id = i.id
                          JOIN unit_measurement um ON i.id_unit_measurement = um.id
                 WHERE ip.person_id = $1 AND ip.ingredient_id = $2
                 ORDER BY ip.purchase_date ASC`,
        [userId, ingredientId],
    );

    return result.rows;
}

interface PurchaseRow {
    quantity: number;
    ingredient_id: number;
}

export async function updatePurchaseQuantity(
    pool: Pool,
    userId: string | number,
    purchaseId: string | number,
    quantity: number,
): Promise<boolean | null> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const purchase = await client.query<PurchaseRow>(
            `SELECT quantity, ingredient_id FROM ingredient_purchases WHERE id = $1 AND person_id = $2 FOR UPDATE`,
            [purchaseId, userId],
        );

        if (purchase.rows.length === 0) {
            await client.query("ROLLBACK");

            return null;
        }

        // apply the purchase edit as a delta on the pantry stock so prior consumption is preserved (recomputing as SUM of purchases would lose it)
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

        await client.query("COMMIT");

        return true;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
