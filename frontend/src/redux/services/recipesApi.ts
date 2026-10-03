import type { PaginatedResult } from "types/pagination";
import type {
    CreateRecipeRequest,
    RecipeDetails,
    RecipeFilterParams,
    RecipeSearchResultItem,
    UpdateRecipeRequest,
} from "types/recipe";
import type { RecipeStatistics } from "types/stats";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";
import { infiniteListProvidesTags, listTag } from "./cacheTags";
import { offsetPagedQuery } from "./infiniteQueryHelpers";

const RECIPE = "Recipe" as const;
const RECIPE_LIST = listTag(RECIPE);

export const recipesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getRecipesByFilters: build.infiniteQuery<
            PaginatedResult<RecipeSearchResultItem>,
            RecipeFilterParams,
            number
        >({
            ...offsetPagedQuery(API_ROUTES.recipes.byFilters),
            providesTags: (result) => infiniteListProvidesTags(RECIPE, result),
        }),
        getRecipesByPerson: build.infiniteQuery<
            PaginatedResult<RecipeSearchResultItem>,
            RecipeFilterParams,
            number
        >({
            ...offsetPagedQuery(API_ROUTES.recipes.byPerson),
            providesTags: (result) => infiniteListProvidesTags(RECIPE, result),
        }),
        getRecipeStats: build.query<RecipeStatistics, null>({
            query: () => ({ url: API_ROUTES.recipes.stats }),
            providesTags: [RECIPE_LIST],
        }),
        getRecipeById: build.query<RecipeDetails, string>({
            query: (id) => ({ url: API_ROUTES.recipes.byId(id) }),
            providesTags: (_result, _error, id) => [{ type: RECIPE, id }],
        }),
        createRecipe: build.mutation<{ id: number }, CreateRecipeRequest>({
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
            // calories follow the ingredients, so calorie badges refetch; so do menus, which show recipes
            invalidatesTags: (_result, _error, { id }) => [
                { type: RECIPE, id },
                RECIPE_LIST,
                { type: "Menu" },
                "Calories",
            ],
        }),
        deleteRecipe: build.mutation<null, string>({
            query: (id) => ({
                url: API_ROUTES.recipes.byId(id),
                method: "DELETE",
            }),
            // the delete cascades into menu_recipe and which menus held it is unknown here, so all refetch
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
    useGetRecipeStatsQuery,
    useGetRecipeByIdQuery,
    useCreateRecipeMutation,
    useUpdateRecipeMutation,
    useDeleteRecipeMutation,
} = recipesApi;
