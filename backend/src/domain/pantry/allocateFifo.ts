export interface PantryLot {
    id: number;
    quantity: number;
}

export interface LotDeduction {
    lotId: number;
    taken: number;
    remaining: number;
}

export interface FifoAllocation {
    deductions: LotDeduction[];
    shortfall: number;
}

// the pantry filter's precision, so float noise never leaves a 0.0000001 lot behind
const QUANTITY_SCALE = 1000;

export function roundQuantity(value: number): number {
    return Math.round(value * QUANTITY_SCALE) / QUANTITY_SCALE;
}

// lots must arrive oldest first
export function allocateFifo(
    lots: PantryLot[],
    needed: number,
): FifoAllocation {
    const deductions: LotDeduction[] = [];
    let stillNeeded = roundQuantity(needed);

    for (const lot of lots) {
        if (stillNeeded <= 0) {
            break;
        }

        const taken = roundQuantity(Math.min(lot.quantity, stillNeeded));

        if (taken <= 0) {
            continue;
        }

        deductions.push({
            lotId: lot.id,
            taken,
            remaining: roundQuantity(lot.quantity - taken),
        });
        stillNeeded = roundQuantity(stillNeeded - taken);
    }

    return { deductions, shortfall: Math.max(stillNeeded, 0) };
}

export interface IngredientLot extends PantryLot {
    ingredient_id: number;
}

export interface IngredientNeed {
    ingredient_id: number;
    quantity: number;
}

export interface IngredientDeduction extends LotDeduction {
    ingredient_id: number;
}

// lots must arrive oldest first
export function allocateNeeds(
    needs: IngredientNeed[],
    lots: IngredientLot[],
): IngredientDeduction[] {
    return needs.flatMap(({ ingredient_id, quantity }) =>
        allocateFifo(
            lots.filter((lot) => lot.ingredient_id === ingredient_id),
            quantity,
        ).deductions.map((deduction) => ({ ...deduction, ingredient_id })),
    );
}
