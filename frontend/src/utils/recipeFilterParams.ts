import type { RecipeFilterParams } from "types/recipe";

import {
    RECIPE_DEFAULT_SORT_ORDER,
    type RecipeFiltersState,
} from "redux/slices/filtersSlice";

export const buildRecipeFilterParams = (
    filters: RecipeFiltersState,
    ingredientName: string | null,
): RecipeFilterParams => ({
    ingredient_name: ingredientName ?? "",
    sort_order: filters.sortOrder,
    type_ids:
        filters.selectedTypes.length > 0
            ? filters.selectedTypes.join(",")
            : undefined,
    start_date: filters.startDate || undefined,
    end_date: filters.endDate || undefined,
    min_cooking_time: filters.minCookingTime || undefined,
    max_cooking_time: filters.maxCookingTime || undefined,
});

// a non-default sort counts as an active filter alongside search/type/time - shared by the filter badge count, the active-filter chips, and the truly-empty vs no-matches decision
export const hasActiveRecipeFilters = (
    filters: RecipeFiltersState & { ingredientName: string | null },
): boolean =>
    Boolean(filters.ingredientName) ||
    Boolean(filters.minCookingTime) ||
    Boolean(filters.maxCookingTime) ||
    filters.sortOrder !== RECIPE_DEFAULT_SORT_ORDER ||
    filters.selectedTypes.length > 0;
