import type { CalorieIntakeRow } from "domain/repositories/CalorieRepository";
import type {
    CookOutcome,
    CookRequirement,
} from "domain/repositories/PantryConsumptionRepository";

export interface CookedIngredient {
    ingredient_id: number;
    slug: string;
    name: string;
    unit_name: string;
    needed: number;
    quantity: number;
}

export interface SkippedIngredient {
    ingredient_id: number;
    slug: string;
    name: string;
}

export interface CookSummary {
    consumptionId: number;
    deducted: CookedIngredient[];
    skipped: SkippedIngredient[];
    calorieIntake: CalorieIntakeRow | null;
}

// needs come in the requirements' order; an ingredient the pantry had none of is skipped, not an error
export function summariseCook(
    requirements: CookRequirement[],
    needed: Map<number, number>,
    outcome: CookOutcome,
): CookSummary {
    const taken = new Map(
        outcome.taken.map((item) => [item.ingredient_id, item.quantity]),
    );
    const deducted: CookedIngredient[] = [];
    const skipped: SkippedIngredient[] = [];

    for (const { ingredient_id, slug, name, unit_name } of requirements) {
        const quantity = taken.get(ingredient_id) ?? 0;

        if (quantity > 0) {
            deducted.push({
                ingredient_id,
                slug,
                name,
                unit_name,
                needed: needed.get(ingredient_id) ?? quantity,
                quantity,
            });
        } else {
            skipped.push({ ingredient_id, slug, name });
        }
    }

    return {
        consumptionId: outcome.consumptionId,
        deducted,
        skipped,
        calorieIntake: outcome.calorieIntake,
    };
}
