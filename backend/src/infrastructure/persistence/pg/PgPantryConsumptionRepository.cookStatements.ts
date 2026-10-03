import type { PoolClient } from "pg";

import type { IngredientDeduction } from "domain/pantry/allocateFifo";
import type { CookInput } from "domain/repositories/PantryConsumptionRepository";

export async function insertConsumption(
    client: PoolClient,
    personId: number,
    input: CookInput,
    calorieIntakeId: number | null,
): Promise<number> {
    const { source } = input;
    const result = await client.query<{ id: number }>(
        `INSERT INTO pantry_consumptions (person_id, recipe_id, menu_id, title, portions, calorie_intake_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
            personId,
            "recipeId" in source ? source.recipeId : null,
            "menuId" in source ? source.menuId : null,
            input.title,
            input.portions,
            calorieIntakeId,
        ],
    );

    return result.rows[0].id;
}

// reads each lot's purchase date before applyDeductions can delete the lot
export async function recordLots(
    client: PoolClient,
    consumptionId: number,
    deductions: IngredientDeduction[],
): Promise<void> {
    await client.query(
        `INSERT INTO pantry_consumption_lots (consumption_id, ingredient_id, purchase_id, quantity, lot_purchase_date)
         SELECT $1, ip.ingredient_id, ip.id, used.taken, ip.purchase_date
         FROM unnest($2::int[], $3::float8[]) AS used(purchase_id, taken)
         JOIN ingredient_purchases ip ON ip.id = used.purchase_id`,
        [
            consumptionId,
            deductions.map((deduction) => deduction.lotId),
            deductions.map((deduction) => deduction.taken),
        ],
    );
}

// the same arithmetic as deleting purchases
export async function applyDeductions(
    client: PoolClient,
    personId: number,
    deductions: IngredientDeduction[],
): Promise<void> {
    const usedUp = deductions.filter((deduction) => deduction.remaining <= 0);
    const shrunk = deductions.filter((deduction) => deduction.remaining > 0);

    await client.query(
        `DELETE FROM ingredient_purchases WHERE id = ANY($1::int[])`,
        [usedUp.map((deduction) => deduction.lotId)],
    );
    await client.query(
        `UPDATE ingredient_purchases ip SET quantity = lot.remaining
         FROM unnest($1::int[], $2::float8[]) AS lot(id, remaining)
         WHERE ip.id = lot.id`,
        [
            shrunk.map((deduction) => deduction.lotId),
            shrunk.map((deduction) => deduction.remaining),
        ],
    );
    await client.query(
        `UPDATE person_ingredients pi
         SET quantity_person_ingradient =
             GREATEST(ROUND((pi.quantity_person_ingradient - used.total)::numeric, 3), 0)
         FROM (
             SELECT ingredient_id, SUM(taken) AS total
             FROM unnest($2::int[], $3::float8[]) AS lot(ingredient_id, taken)
             GROUP BY ingredient_id
         ) used
         WHERE pi.person_id = $1 AND pi.ingredient_id = used.ingredient_id`,
        [
            personId,
            deductions.map((deduction) => deduction.ingredient_id),
            deductions.map((deduction) => deduction.taken),
        ],
    );
    // an ingredient cooked down to nothing leaves the pantry, like deleting its last purchase does
    await client.query(
        `DELETE FROM person_ingredients pi
         WHERE pi.person_id = $1 AND pi.ingredient_id = ANY($2::int[])
           AND pi.quantity_person_ingradient <= 0
           AND NOT EXISTS (
             SELECT 1 FROM ingredient_purchases ip
             WHERE ip.person_id = pi.person_id AND ip.ingredient_id = pi.ingredient_id
           )`,
        [personId, deductions.map((deduction) => deduction.ingredient_id)],
    );
}
