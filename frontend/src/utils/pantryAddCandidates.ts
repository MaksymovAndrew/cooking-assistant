import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

// what can still be added to the pantry: not already stocked and not already picked in this batch
export const pantryAddCandidates = (
    allIngredients: Ingredient[],
    pantry: PantryIngredient[],
    selectedIds: number[],
): Ingredient[] => {
    const excluded = new Set([
        ...pantry.map((item) => item.id),
        ...selectedIds,
    ]);

    return allIngredients.filter((ingredient) => !excluded.has(ingredient.id));
};
