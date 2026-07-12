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
            invalidatesTags: (_result, _error, { id }) => [
                { type: RECIPE, id },
                RECIPE_LIST,
            ],
        }),
        deleteRecipe: build.mutation<null, string>({
            query: (id) => ({
                url: API_ROUTES.recipes.byId(id),
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: RECIPE, id },
                RECIPE_LIST,
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
