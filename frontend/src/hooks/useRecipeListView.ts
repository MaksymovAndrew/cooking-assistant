import { useMemo } from "react";

import type { RecipeFilterParams } from "types/recipe";

import { useAppSelector } from "redux/hooks";
import { selectIsAuthed } from "redux/selectors/sessionSelectors";
import { useGetMeQuery } from "redux/services/authApi";
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
import { useGetUserIngredientsQuery } from "redux/services/userIngredientsApi";

import { useCalorieBudget } from "hooks/useCalorieBudget";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";
import { RECIPE_FILTER_DEFS } from "utils/filters/recipeFilterDefs";
import { getQueryErrorMessage } from "utils/queryError";

import {
    isPantryFilterEmpty,
    isRecipeListEmpty,
} from "./recipeListViewHelpers";
import { useListFilters } from "./useListFilters";

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

    // skipped until the session is confirmed authed - not just "not yet known to be a guest" -
    // so this list stays reachable without a 401 tripping the global auth redirect on a page
    // that's public now, including during the initial checking window
    const isAuthed = useAppSelector(selectIsAuthed);
    // already fetched by the pantry page/home dashboard - a cache read, not a new request
    const {
        data: pantry = [],
        isLoading: isPantryLoading,
        isUninitialized: isPantryUninitialized,
    } = useGetUserIngredientsQuery(null, { skip: !isAuthed });
    const isPantryEmpty = isPantryFilterEmpty(
        filters.inPantry,
        pantry.length,
        isPantryLoading,
        isPantryUninitialized,
    );

    const isPerson = source === RECIPE_SOURCE.person;
    const byFilters = useGetRecipesByFiltersInfiniteQuery(params, {
        skip: isPerson || isPantryEmpty,
    });
    const byPerson = useGetRecipesByPersonInfiniteQuery(params, {
        skip: !isPerson || isPantryEmpty,
    });
    const active = isPerson ? byPerson : byFilters;

    // already fetched by PrivateRoute on mount, so this is a cache read, not a new request - used to flag the current user's own recipes in the "all" list
    const { data: currentUser } = useGetMeQuery(null);
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
        currentUserId: currentUser?.id ?? null,
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
