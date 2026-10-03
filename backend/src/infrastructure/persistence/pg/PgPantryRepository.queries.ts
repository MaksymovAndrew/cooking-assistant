import type { Pool } from "pg";

import type {
    PantryIngredient,
    PurchaseHistoryEntry,
} from "domain/repositories/PantryRepository";

export async function findPantryByUser(
    pool: Pool,
    userId: number,
): Promise<PantryIngredient[]> {
    const result = await pool.query<PantryIngredient>(
        `SELECT
         pi.ingredient_id,
         i.slug AS ingredient_slug,
         i.name AS ingredient_name,
         i.category,
         pi.quantity_person_ingradient,
         um.unit_name,
         i.allergens,
         i.days_to_expire,
         i.seasonality,
         i.storage_condition,
         i.calories_per_unit,
         MIN(ip.purchase_date) AS purchase_date,
         COALESCE(
           json_agg(
             json_build_object('id', ip.id, 'quantity', ip.quantity, 'purchase_date', ip.purchase_date)
             ORDER BY ip.purchase_date ASC
           ) FILTER (WHERE ip.id IS NOT NULL),
           '[]'
         ) AS lots
       FROM person_ingredients pi
       JOIN ingredients i ON pi.ingredient_id = i.id
       JOIN unit_measurement um ON i.id_unit_measurement = um.id
       LEFT JOIN ingredient_purchases ip
         ON ip.person_id = pi.person_id AND ip.ingredient_id = pi.ingredient_id
       WHERE pi.person_id = $1
       GROUP BY
         pi.ingredient_id, i.slug, i.name, i.category, pi.quantity_person_ingradient,
         um.unit_name, i.allergens, i.days_to_expire, i.seasonality, i.storage_condition,
         i.calories_per_unit`,
        [userId],
    );

    return result.rows;
}

export async function findIngredientPurchaseHistory(
    pool: Pool,
    userId: number,
    ingredientId: number,
): Promise<PurchaseHistoryEntry[]> {
    const result = await pool.query<PurchaseHistoryEntry>(
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
