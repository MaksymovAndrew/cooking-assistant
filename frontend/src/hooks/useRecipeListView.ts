import { useMemo } from "react";

import type { RecipeFilterParams } from "types/recipe";

import {
    flattenPages,
    getPaginatedTotal,
} from "redux/services/infiniteQueryHelpers";
import { useGetIngredientsQuery } from "redux/services/ingredientsApi";
import {
    useGetRecipesByFiltersInfiniteQuery,
    useGetRecipesByPersonInfiniteQuery,
} from "redux/services/recipesApi";
import { useGetRecipeTypesQuery } from "redux/services/recipeTypesApi";

import { useCalorieBudget } from "hooks/useCalorieBudget";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";
import { RECIPE_FILTER_DEFS } from "utils/filters/recipeFilterDefs";
import { getQueryErrorMessage } from "utils/queryError";

import { isRecipeListEmpty } from "./recipeListViewHelpers";
import { useListFilters } from "./useListFilters";
import { useRecipeListGate } from "./useRecipeListGate";

export type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

export const RECIPE_SOURCE = {
    all: "all",
    person: "person",
} as const;

export type RecipeSource = (typeof RECIPE_SOURCE)[keyof typeof RECIPE_SOURCE];

// view model for the two recipe lists: the URL is the single source of truth for
// filters, pages come from RTK Query's infiniteQuery, sorting is server-side
export const useRecipeListView = (source: RecipeSource) => {
    const {
        values: filters,
        setValue,
        setValues,
        reset: resetFilters,
        params,
        activeFilters,
        activeCount,
        hasActiveFilters,
    } = useListFilters<RecipeFilterState, RecipeFilterParams>(
        RECIPE_FILTER_DEFS,
    );

    // feeds the ingredients filter's search-and-pick UI - already cached by the ingredient picker/pantry pages, so this is a read, not a new request
    const { data: ingredientCatalog = [] } = useGetIngredientsQuery(null);

    const { queryParams, isHeldBack, isPantryEmpty } = useRecipeListGate(
        filters,
        params,
    );

    const isPerson = source === RECIPE_SOURCE.person;
    const byFilters = useGetRecipesByFiltersInfiniteQuery(queryParams, {
        skip: isPerson || isHeldBack,
    });
    const byPerson = useGetRecipesByPersonInfiniteQuery(queryParams, {
        skip: !isPerson || isHeldBack,
    });
    const active = isPerson ? byPerson : byFilters;

    // computed once here, not per-card, so every RecipeCard just reads a plain boolean prop
    const { goal: calorieGoal, remaining: calorieRemaining } =
        useCalorieBudget();
    const recipes = useMemo(() => flattenPages(active.data), [active.data]);
    const total = getPaginatedTotal(active.data);
    const hasLoadedRecipes = recipes.length > 0;
    const errorMessage = active.isError
        ? getQueryErrorMessage(active.error)
        : null;

    const { data: allTypes = [] } = useGetRecipeTypesQuery(null);

    const hasSelectedTypes = filters.types.length > 0;
    const { data: descriptionTypes = [] } = useGetRecipeTypesQuery(
        hasSelectedTypes ? { ids: filters.types.join(",") } : null,
        { skip: !hasSelectedTypes },
    );
    const descriptions = descriptionTypes.filter((type) =>
        filters.types.includes(type.id),
    );
    const typesHeader = descriptions.map((type) => type.type_name).join(", ");

    return {
        filters,
        setValue,
        setValues,
        resetFilters,
        activeFilters,
        activeCount,
        hasActiveFilters,
        types: allTypes,
        ingredients: ingredientCatalog,
        recipes,
        calorieGoal,
        calorieRemaining,
        error: !hasLoadedRecipes ? errorMessage : null,
        noRecipes: isRecipeListEmpty(
            isPantryEmpty,
            active.isSuccess,
            hasLoadedRecipes,
        ),
        isPantryEmpty,
        descriptions,
        typesHeader,
        total,
        loadedCount: recipes.length,
        hasNextPage: active.hasNextPage,
        isFetchingNextPage: active.isFetchingNextPage,
        fetchNextPage: active.fetchNextPage,
        loadMoreError: hasLoadedRecipes ? errorMessage : null,
        refetch: active.refetch,
    };
};
