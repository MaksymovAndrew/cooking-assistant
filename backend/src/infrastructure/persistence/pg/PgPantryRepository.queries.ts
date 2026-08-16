import type { Pool } from "pg";

interface PantryLotRow {
    quantity: number;
    purchase_date: Date;
}

interface PantryIngredientRow {
    ingredient_id: number;
    ingredient_slug: string;
    ingredient_name: string;
    category: string;
    quantity_person_ingradient: number;
    unit_name: string;
    allergens: string[];
    days_to_expire: number | null;
    seasonality: string | null;
    storage_condition: string | null;
    // the oldest (soonest-expiring) lot's date - MIN(ingredient_purchases.purchase_date), not
    // person_ingredients.purchase_date, which a top-up resets and would wrongly "refresh" older stock
    purchase_date: Date | null;
    lots: PantryLotRow[];
    calories_per_unit: number | null;
}

export async function findPantryByUser(
    pool: Pool,
    userId: string | number,
): Promise<unknown[]> {
    const result = await pool.query<PantryIngredientRow>(
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
             json_build_object('quantity', ip.quantity, 'purchase_date', ip.purchase_date)
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
