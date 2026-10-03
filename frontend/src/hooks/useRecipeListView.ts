import { useMemo } from "react";
import { useTranslation } from "react-i18next";

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
import { useSelectedRecipeTypes } from "hooks/useSelectedRecipeTypes";

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

export const useRecipeListView = (source: RecipeSource) => {
    const { t } = useTranslation();
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
        ? getQueryErrorMessage(t, active.error)
        : null;

    const { data: allTypes = [] } = useGetRecipeTypesQuery(null);

    const { descriptions, typesHeader } = useSelectedRecipeTypes(filters.types);

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
