import type { Ingredient } from "types/ingredient";
import type { RecipeFilterParams } from "types/recipe";

import {
    RECIPE_DEFAULT_SORT_ORDER,
    type RecipeFiltersState,
} from "redux/slices/filtersSlice";

import { resolveIngredientName } from "utils/ingredientName";

// the catalog has hundreds of entries - cap how many ids a text search can turn into,
// matching the backend's own cap in recipe.schemas.ts
const MAX_INGREDIENT_FILTER_IDS = 20;

// matches typed text against every catalog ingredient's resolved name - undefined means either
// no text was typed, or text was typed but nothing matched (the caller decides what to do then)
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

export const buildRecipeFilterParams = (
    filters: RecipeFiltersState,
    ingredientIds: string | undefined,
): RecipeFilterParams => ({
    ingredient_ids: ingredientIds,
    sort_order: filters.sortOrder,
    type_ids:
        filters.selectedTypes.length > 0
            ? filters.selectedTypes.join(",")
            : undefined,
    start_date: filters.startDate || undefined,
    end_date: filters.endDate || undefined,
    min_cooking_time: filters.minCookingTime || undefined,
    max_cooking_time: filters.maxCookingTime || undefined,
    in_pantry: filters.inPantry || undefined,
});

// a non-default sort counts as an active filter alongside search/type/time - shared by the filter badge count, the active-filter chips, and the truly-empty vs no-matches decision
export const hasActiveRecipeFilters = (
    filters: RecipeFiltersState & { ingredientName: string | null },
): boolean =>
    Boolean(filters.ingredientName) ||
    Boolean(filters.minCookingTime) ||
    Boolean(filters.maxCookingTime) ||
    filters.sortOrder !== RECIPE_DEFAULT_SORT_ORDER ||
    filters.selectedTypes.length > 0 ||
    filters.inPantry;
