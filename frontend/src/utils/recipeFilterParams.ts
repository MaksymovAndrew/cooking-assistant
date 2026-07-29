import type { Ingredient } from "types/ingredient";

import { resolveIngredientName } from "utils/ingredientName";

// caps how many ids a text search can turn into, matching the backend's own cap in recipe.schemas.ts
const MAX_INGREDIENT_FILTER_IDS = 20;

// matches typed text against every catalog ingredient's resolved name - undefined means no text, or no match (the caller decides what to do then)
export const matchIngredientIds = (
    ingredientName: string | null,
    catalog: Ingredient[],
): string | undefined => {
    const query = ingredientName?.trim().toLowerCase();

    if (!query) {
        return undefined;
    }

    const matchedIds = catalog
        .filter((ingredient) =>
            resolveIngredientName(ingredient).toLowerCase().includes(query),
        )
        .slice(0, MAX_INGREDIENT_FILTER_IDS)
        .map((ingredient) => ingredient.id);

    return matchedIds.length > 0 ? matchedIds.join(",") : undefined;
};
