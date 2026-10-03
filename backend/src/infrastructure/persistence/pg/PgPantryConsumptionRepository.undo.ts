import type { Pool, PoolClient } from "pg";

import type { UndoCookingResult } from "domain/repositories/PantryConsumptionRepository";

import { inPersonWriteTransaction } from "./personWriteTransaction";

// a used-up lot returns under its own id and purchase date, so its expiry is unchanged
async function restoreLots(
    client: PoolClient,
    personId: number,
    consumptionId: number,
): Promise<void> {
    await client.query(
        `INSERT INTO ingredient_purchases (id, person_id, ingredient_id, quantity, purchase_date)
         SELECT purchase_id, $2, ingredient_id, quantity, lot_purchase_date
         FROM pantry_consumption_lots WHERE consumption_id = $1
         ON CONFLICT (id) DO UPDATE
         SET quantity = ingredient_purchases.quantity + EXCLUDED.quantity`,
        [consumptionId, personId],
    );
    await client.query(
        `INSERT INTO person_ingredients (person_id, ingredient_id, quantity_person_ingradient, purchase_date)
         SELECT $2, ingredient_id, SUM(quantity), COALESCE(MIN(lot_purchase_date)::date, CURRENT_DATE)
         FROM pantry_consumption_lots WHERE consumption_id = $1
         GROUP BY ingredient_id
         ON CONFLICT (person_id, ingredient_id) DO UPDATE
         SET quantity_person_ingradient =
             person_ingredients.quantity_person_ingradient + EXCLUDED.quantity_person_ingradient`,
        [consumptionId, personId],
    );
}

export function undoCooking(
    pool: Pool,
    personId: number,
    consumptionId: number,
    windowMs: number,
): Promise<UndoCookingResult> {
    return inPersonWriteTransaction<UndoCookingResult>(
        pool,
        personId,
        "person_not_found",
        async (client) => {
            const found = await client.query(
                `SELECT 1 FROM pantry_consumptions WHERE id = $1 AND person_id = $2`,
                [consumptionId, personId],
            );

            if (found.rowCount === 0) {
                return { commit: false, result: "not_found" };
            }

            // only the first undo inside the window gets a row back
            const claimed = await client.query<{
                calorie_intake_id: number | null;
            }>(
                `UPDATE pantry_consumptions SET undone_at = now()
                 WHERE id = $1 AND undone_at IS NULL
                   AND cooked_at > now() - make_interval(secs => $2::float8 / 1000)
                 RETURNING calorie_intake_id`,
                [consumptionId, windowMs],
            );

            if (claimed.rowCount === 0) {
                return { commit: false, result: "unavailable" };
            }

            await restoreLots(client, personId, consumptionId);
            await client.query(
                `DELETE FROM calorie_intake WHERE id = $1 AND person_id = $2`,
                [claimed.rows[0].calorie_intake_id, personId],
            );

            return { commit: true, result: "undone" };
        },
    );
}
