import type { Pool } from "pg";

import type { PantryIngredientInput } from "domain/repositories/PantryRepository";

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
    purchase_date: Date;
}

interface QuantityRow {
    quantity_person_ingradient: number;
}

// 2 decimal places
const QUANTITY_ROUNDING_FACTOR = 100;

// fractional quantities (kg, l) can leave a subtraction like 0.3 - 0.1 a hair off zero;
// round before branching so that doesn't get mistaken for a real increase or decrease
function roundQuantity(value: number): number {
    return (
        Math.round(value * QUANTITY_ROUNDING_FACTOR) / QUANTITY_ROUNDING_FACTOR
    );
}

interface PurchaseHistoryRow {
    id: number;
    quantity: number;
    purchase_date: Date;
    unit_name: string;
    days_to_expire: number | null;
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
         pi.purchase_date
       FROM person_ingredients pi
       JOIN ingredients i ON pi.ingredient_id = i.id
       JOIN unit_measurement um ON i.id_unit_measurement = um.id
       WHERE pi.person_id = $1`,
        [userId],
    );

    return result.rows;
}

export async function updatePantryQuantities(
    pool: Pool,
    userId: string | number,
    items: PantryIngredientInput[],
): Promise<void> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const ingredient of items) {
            const { rows } = await client.query<QuantityRow>(
                `SELECT quantity_person_ingradient
             FROM person_ingredients
             WHERE person_id = $1 AND ingredient_id = $2
             FOR UPDATE`,
                [userId, ingredient.id],
            );

            const currentQuantity = rows[0]?.quantity_person_ingradient ?? 0;
            const addedQuantity = roundQuantity(
                ingredient.quantity_person_ingradient - currentQuantity,
            );

            if (addedQuantity > 0) {
                // an increase is a purchase: upsert the pantry row and log it
                await client.query(
                    `INSERT INTO person_ingredients (person_id, ingredient_id, quantity_person_ingradient, purchase_date)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (person_id, ingredient_id)
           DO UPDATE SET quantity_person_ingradient = $3, purchase_date = NOW()`,
                    [
                        userId,
                        ingredient.id,
                        ingredient.quantity_person_ingradient,
                    ],
                );

                await client.query(
                    `INSERT INTO ingredient_purchases (person_id, ingredient_id, quantity, purchase_date)
           VALUES ($1, $2, $3, NOW())`,
                    [userId, ingredient.id, addedQuantity],
                );
            } else if (addedQuantity < 0) {
                if (ingredient.quantity_person_ingradient === 0) {
                    await client.query(
                        `DELETE FROM ingredient_purchases
           WHERE person_id = $1 AND ingredient_id = $2`,
                        [userId, ingredient.id],
                    );
                    await client.query(
                        `DELETE FROM person_ingredients
           WHERE person_id = $1 AND ingredient_id = $2`,
                        [userId, ingredient.id],
                    );
                } else {
                    await client.query(
                        `UPDATE person_ingredients
           SET quantity_person_ingradient = $1
           WHERE person_id = $2 AND ingredient_id = $3`,
                        [
                            ingredient.quantity_person_ingradient,
                            userId,
                            ingredient.id,
                        ],
                    );
                }
            }
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
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
