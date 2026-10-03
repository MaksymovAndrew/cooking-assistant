import type { Ingredient } from "types/ingredient";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

export const ingredientsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getIngredients: build.query<Ingredient[], null>({
            query: () => ({ url: API_ROUTES.ingredients.list }),
            providesTags: ["Ingredient"],
        }),
    }),
});

export const { useGetIngredientsQuery } = ingredientsApi;
