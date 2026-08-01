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
