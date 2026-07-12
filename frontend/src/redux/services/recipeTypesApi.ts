import type { RecipeTypesQuery, RecipeTypeSummary } from "types/recipeType";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

// recipe types are read-only reference data; one cache entry per distinct query arg (full list vs filtered by ids), shared across every page that asks for it
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
