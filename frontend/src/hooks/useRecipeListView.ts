import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { SEARCH_PARAM_INGREDIENT_NAME } from "constants/queryParams";

import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectRecipeFilters } from "redux/selectors/filtersSelectors";
import {
    flattenPages,
    getPaginatedTotal,
} from "redux/services/infiniteQueryHelpers";
import {
    useGetRecipesByFiltersInfiniteQuery,
    useGetRecipesByPersonInfiniteQuery,
} from "redux/services/recipesApi";
import { useGetRecipeTypesQuery } from "redux/services/recipeTypesApi";
import type { RecipeFiltersState } from "redux/slices/filtersSlice";
import {
    setRecipeEndDate,
    setRecipeMaxCookingTime,
    setRecipeMinCookingTime,
    setRecipeSelectedTypes,
    setRecipeSortOrder,
    setRecipeStartDate,
} from "redux/slices/filtersSlice";

import { getQueryErrorMessage } from "utils/queryError";
import { buildRecipeFilterParams } from "utils/recipeFilterParams";

export interface RecipeFilterState extends RecipeFiltersState {
    ingredientName: string | null;
}

export const RECIPE_SOURCE = {
    all: "all",
    person: "person",
} as const;

export type RecipeSource = (typeof RECIPE_SOURCE)[keyof typeof RECIPE_SOURCE];

// view model for the two recipe lists: filters come from the store + the URL
// search, pages come from RTK Query's infiniteQuery, sorting is fully server-side
export const useRecipeListView = (source: RecipeSource) => {
    const dispatch = useAppDispatch();
    const recipeFilters = useAppSelector(selectRecipeFilters);
    const [searchParams] = useSearchParams();
    const ingredientName = searchParams.get(SEARCH_PARAM_INGREDIENT_NAME);

    const params = useMemo(
        () => buildRecipeFilterParams(recipeFilters, ingredientName),
        [recipeFilters, ingredientName],
    );

    const isPerson = source === RECIPE_SOURCE.person;
    const byFilters = useGetRecipesByFiltersInfiniteQuery(params, {
        skip: isPerson,
    });
    const byPerson = useGetRecipesByPersonInfiniteQuery(params, {
        skip: !isPerson,
    });
    const active = isPerson ? byPerson : byFilters;

    const recipes = useMemo(() => flattenPages(active.data), [active.data]);
    const total = getPaginatedTotal(active.data);
    const hasLoadedRecipes = recipes.length > 0;
    const errorMessage = active.isError
        ? getQueryErrorMessage(active.error)
        : null;

    const { data: allTypes = [] } = useGetRecipeTypesQuery(null);

    const hasSelectedTypes = recipeFilters.selectedTypes.length > 0;
    const { data: descriptionTypes = [] } = useGetRecipeTypesQuery(
        hasSelectedTypes
            ? { ids: recipeFilters.selectedTypes.join(",") }
            : null,
        { skip: !hasSelectedTypes },
    );
    const descriptions = descriptionTypes.filter((type) =>
        recipeFilters.selectedTypes.includes(type.id),
    );
    const typesHeader = descriptions.map((type) => type.type_name).join(", ");

    return {
        filters: { ...recipeFilters, ingredientName },
        setSelectedTypes: (types: number[]) =>
            dispatch(setRecipeSelectedTypes(types)),
        setStartDate: (date: string) => dispatch(setRecipeStartDate(date)),
        setEndDate: (date: string) => dispatch(setRecipeEndDate(date)),
        setMinCookingTime: (time: string) =>
            dispatch(setRecipeMinCookingTime(time)),
        setMaxCookingTime: (time: string) =>
            dispatch(setRecipeMaxCookingTime(time)),
        setSortOrder: (order: string) => dispatch(setRecipeSortOrder(order)),
        types: allTypes,
        recipes,
        error: !hasLoadedRecipes ? errorMessage : null,
        noRecipes: active.isSuccess && !hasLoadedRecipes,
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
