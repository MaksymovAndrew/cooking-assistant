export type PantryRecipesCardState =
    "empty-pantry" | "counting" | "none" | "ready";

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
