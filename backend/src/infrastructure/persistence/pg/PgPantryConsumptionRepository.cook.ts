import type { Pool } from "pg";

import { allocateNeeds, roundQuantity } from "domain/pantry/allocateFifo";
import type {
    CookInput,
    CookResult,
    CookTaken,
} from "domain/repositories/PantryConsumptionRepository";

import { inPersonWriteTransaction } from "./personWriteTransaction";
import { insertIntake } from "./PgCalorieRepository.insertIntake";
import {
    applyDeductions,
    insertConsumption,
    recordLots,
} from "./PgPantryConsumptionRepository.cookStatements";

interface LotRow {
    id: number;
    ingredient_id: number;
    quantity: number;
}

function totalsByIngredient(
    deductions: { ingredient_id: number; taken: number }[],
): CookTaken[] {
    const totals = new Map<number, number>();

    for (const { ingredient_id, taken } of deductions) {
        totals.set(ingredient_id, (totals.get(ingredient_id) ?? 0) + taken);
    }

    return [...totals].map(([ingredient_id, quantity]) => ({
        ingredient_id,
        quantity: roundQuantity(quantity),
    }));
}

// one transaction under the person lock, so a cook can't race another pantry write or its own undo
export function cook(
    pool: Pool,
    personId: number,
    input: CookInput,
): Promise<CookResult> {
    return inPersonWriteTransaction<CookResult>(
        pool,
        personId,
        "person_not_found",
        async (client) => {
            // undated lots count as the oldest
            const lots = await client.query<LotRow>(
                `SELECT id, ingredient_id, quantity FROM ingredient_purchases
                 WHERE person_id = $1 AND ingredient_id = ANY($2::int[])
                 ORDER BY purchase_date ASC NULLS FIRST, id ASC
                 FOR UPDATE`,
                [personId, input.needs.map((need) => need.ingredient_id)],
            );
            const deductions = allocateNeeds(input.needs, lots.rows);
            const calorieIntake = input.calorieEntry
                ? await insertIntake(client, personId, input.calorieEntry)
                : null;
            const consumptionId = await insertConsumption(
                client,
                personId,
                input,
                calorieIntake?.id ?? null,
            );

            await recordLots(client, consumptionId, deductions);
            await applyDeductions(client, personId, deductions);

            return {
                commit: true,
                result: {
                    consumptionId,
                    taken: totalsByIngredient(deductions),
                    calorieIntake,
                },
            };
        },
    );
}
