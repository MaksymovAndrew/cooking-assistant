import { PAGE_SIZE } from "constants/pagination";
import type { PaginatedResult } from "types/pagination";
import type {
    CreateRecipeRequest,
    RecipeDetails,
    RecipeFilterParams,
    RecipeSearchResultItem,
    RecipeWithIngredientNames,
    UpdateRecipeRequest,
} from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";
import {
    infiniteListProvidesTags,
    listProvidesTags,
    listTag,
} from "./cacheTags";
import { getNextOffsetParam } from "./infiniteQueryHelpers";

const RECIPE = "Recipe" as const;
const RECIPE_LIST = listTag(RECIPE);

export const recipesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getRecipesByFilters: build.infiniteQuery<
            PaginatedResult<RecipeSearchResultItem>,
            RecipeFilterParams,
            number
        >({
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: getNextOffsetParam,
            },
            query: ({ queryArg, pageParam }) => ({
                url: API_ROUTES.recipes.byFilters,
                params: { ...queryArg, limit: PAGE_SIZE, offset: pageParam },
            }),
            providesTags: (result) => infiniteListProvidesTags(RECIPE, result),
        }),
        getRecipesByPerson: build.infiniteQuery<
            PaginatedResult<RecipeSearchResultItem>,
            RecipeFilterParams,
            number
        >({
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: getNextOffsetParam,
            },
            query: ({ queryArg, pageParam }) => ({
                url: API_ROUTES.recipes.byPerson,
                params: { ...queryArg, limit: PAGE_SIZE, offset: pageParam },
            }),
            providesTags: (result) => infiniteListProvidesTags(RECIPE, result),
        }),
        getAllRecipes: build.query<RecipeWithIngredientNames[], null>({
            query: () => ({ url: API_ROUTES.recipes.list }),
            providesTags: (result) => listProvidesTags(RECIPE, result),
        }),
        getRecipeById: build.query<RecipeDetails, string>({
            query: (id) => ({ url: API_ROUTES.recipes.byId(id) }),
            providesTags: (_result, _error, id) => [{ type: RECIPE, id }],
        }),
        createRecipe: build.mutation<null, CreateRecipeRequest>({
            query: (data) => ({
                url: API_ROUTES.recipes.create,
                method: "POST",
                data,
            }),
            invalidatesTags: [RECIPE_LIST],
        }),
        updateRecipe: build.mutation<
            null,
            { id: string; data: UpdateRecipeRequest }
        >({
            query: ({ id, data }) => ({
                url: API_ROUTES.recipes.byId(id),
                method: "PUT",
                data,
            }),
            // calories_computed can change along with the ingredients, so the calorie budget
            // and over-budget badges (which read a recipe's current calories) must refetch too
            invalidatesTags: (_result, _error, { id }) => [
                { type: RECIPE, id },
                RECIPE_LIST,
                "Calories",
            ],
        }),
        deleteRecipe: build.mutation<null, string>({
            query: (id) => ({
                url: API_ROUTES.recipes.byId(id),
                method: "DELETE",
            }),
            // the backend cascades the delete into every menu_recipe row that referenced this
            // recipe, so any menu that contained it changes too - a plain { type: "Menu" } tag
            // (no id) invalidates every cached menu list and every menu detail, since the client
            // has no way to know in advance which specific menus were affected
            invalidatesTags: (_result, _error, id) => [
                { type: RECIPE, id },
                RECIPE_LIST,
                { type: "Menu" },
                "Calories",
            ],
        }),
    }),
});

export const {
    useGetRecipesByFiltersInfiniteQuery,
    useGetRecipesByPersonInfiniteQuery,
    useGetAllRecipesQuery,
    useGetRecipeByIdQuery,
    useCreateRecipeMutation,
    useUpdateRecipeMutation,
    useDeleteRecipeMutation,
} = recipesApi;
