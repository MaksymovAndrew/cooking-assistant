import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "./axiosBaseQuery";

// single API slice for the whole backend; domain endpoints are injected from their own files via baseApi.injectEndpoints, so there is one cache + config root
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: axiosBaseQuery(),
    tagTypes: [
        "RecipeType",
        "Ingredient",
        "MenuCategory",
        "Recipe",
        "Menu",
        "Pantry",
        "Me",
        "Calories",
    ],
    endpoints: () => ({}),
});
