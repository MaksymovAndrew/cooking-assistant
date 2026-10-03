import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "./axiosBaseQuery";

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
        "ShoppingList",
        "DietPreferences",
        "Tag",
    ],
    endpoints: () => ({}),
});
