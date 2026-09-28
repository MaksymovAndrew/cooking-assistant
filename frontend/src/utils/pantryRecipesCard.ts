export type PantryRecipesCardState =
    "empty-pantry" | "counting" | "none" | "ready";

// which message the home pantry card shows: nothing to cook from, still counting, or a count
export const getPantryRecipesCardState = (
    pantryCount: number,
    cookableCount: number | null,
): PantryRecipesCardState => {
    if (pantryCount === 0) {
        return "empty-pantry";
    }

    if (cookableCount === null) {
        return "counting";
    }

    return cookableCount === 0 ? "none" : "ready";
};
