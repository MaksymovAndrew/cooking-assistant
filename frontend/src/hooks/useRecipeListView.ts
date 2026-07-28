import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { SEARCH_PARAM_INGREDIENT_NAME } from "constants/queryParams";

import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectRecipeFilters } from "redux/selectors/filtersSelectors";
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
import {
    RECIPE_DEFAULT_SORT_ORDER,
    type RecipeFiltersState,
    setRecipeEndDate,
    setRecipeInPantry,
    setRecipeMaxCookingTime,
    setRecipeMinCookingTime,
    setRecipeSelectedTypes,
    setRecipeSortOrder,
    setRecipeStartDate,
} from "redux/slices/filtersSlice";

import { getQueryErrorMessage } from "utils/queryError";
import {
    buildRecipeFilterParams,
    hasActiveRecipeFilters,
    matchIngredientIds,
} from "utils/recipeFilterParams";

import {
    hasUnmatchedIngredientSearch,
    isPantryFilterEmpty,
    isRecipeListEmpty,
    shouldSkipRecipesRequest,
} from "./recipeListViewHelpers";

export interface RecipeFilterState extends RecipeFiltersState {
    ingredientName: string | null;
}

export const RECIPE_SOURCE = {
    all: "all",
    person: "person",
} as const;

export type RecipeSource = (typeof RECIPE_SOURCE)[keyof typeof RECIPE_SOURCE];

// view model for the two recipe lists: filters come from the store + the URL search, pages come from RTK Query's infiniteQuery, sorting is server-side
export const useRecipeListView = (source: RecipeSource) => {
    const dispatch = useAppDispatch();
    const recipeFilters = useAppSelector(selectRecipeFilters);
    const [searchParams, setSearchParams] = useSearchParams();
    const ingredientName = searchParams.get(SEARCH_PARAM_INGREDIENT_NAME);
    const filters = { ...recipeFilters, ingredientName };

    // the catalog is already cached by the ingredient picker/pantry pages - this is a read, not a new request
    const { data: catalog = [] } = useGetIngredientsQuery(null);
    const matchedIngredientIds = useMemo(
        () => matchIngredientIds(ingredientName, catalog),
        [ingredientName, catalog],
    );
    const hasUnmatchedSearch = hasUnmatchedIngredientSearch(
        ingredientName,
        matchedIngredientIds,
    );

    // already fetched by the pantry page/home dashboard - a cache read, not a new request
    const { data: pantry = [] } = useGetUserIngredientsQuery(null);
    const isPantryEmpty = isPantryFilterEmpty(
        recipeFilters.inPantry,
        pantry.length,
    );
    const skipRecipesRequest = shouldSkipRecipesRequest(
        hasUnmatchedSearch,
        isPantryEmpty,
    );

    const params = useMemo(
        () => buildRecipeFilterParams(recipeFilters, matchedIngredientIds),
        [recipeFilters, matchedIngredientIds],
    );

    const isPerson = source === RECIPE_SOURCE.person;
    const byFilters = useGetRecipesByFiltersInfiniteQuery(params, {
        skip: isPerson || skipRecipesRequest,
    });
    const byPerson = useGetRecipesByPersonInfiniteQuery(params, {
        skip: !isPerson || skipRecipesRequest,
    });
    const active = isPerson ? byPerson : byFilters;

    // already fetched by PrivateRoute on mount, so this is a cache read, not a new request - used to flag the current user's own recipes in the "all" list
    const { data: currentUser } = useGetMeQuery(null);
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

    const clearFilters = () => {
        setSearchParams({});
        dispatch(setRecipeSelectedTypes([]));
        dispatch(setRecipeMinCookingTime(""));
        dispatch(setRecipeMaxCookingTime(""));
        dispatch(setRecipeSortOrder(RECIPE_DEFAULT_SORT_ORDER));
        dispatch(setRecipeInPantry(false));
    };

    return {
        filters,
        setSelectedTypes: (types: number[]) =>
            dispatch(setRecipeSelectedTypes(types)),
        setStartDate: (date: string) => dispatch(setRecipeStartDate(date)),
        setEndDate: (date: string) => dispatch(setRecipeEndDate(date)),
        setMinCookingTime: (time: string) =>
            dispatch(setRecipeMinCookingTime(time)),
        setMaxCookingTime: (time: string) =>
            dispatch(setRecipeMaxCookingTime(time)),
        setSortOrder: (order: string) => dispatch(setRecipeSortOrder(order)),
        setInPantry: (value: boolean) => dispatch(setRecipeInPantry(value)),
        clearFilters,
        hasActiveFilters: hasActiveRecipeFilters(filters),
        types: allTypes,
        recipes,
        currentUserId: currentUser?.id ?? null,
        error: !hasLoadedRecipes ? errorMessage : null,
        noRecipes: isRecipeListEmpty(
            hasUnmatchedSearch,
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
