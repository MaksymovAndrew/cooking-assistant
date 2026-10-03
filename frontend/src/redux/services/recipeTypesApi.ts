import type { RecipeTypesQuery, RecipeTypeSummary } from "types/recipeType";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

export const recipeTypesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getRecipeTypes: build.query<
            RecipeTypeSummary[],
            RecipeTypesQuery | null
        >({
            query: (params) => ({
                url: API_ROUTES.recipeTypes.list,
                params,
            }),
            providesTags: ["RecipeType"],
        }),
    }),
});

export const { useGetRecipeTypesQuery } = recipeTypesApi;
