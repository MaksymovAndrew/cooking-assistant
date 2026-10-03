import type { MenuCategory } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

export const menuCategoriesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getMenuCategories: build.query<MenuCategory[], null>({
            query: () => ({ url: API_ROUTES.menuCategories.list }),
            providesTags: ["MenuCategory"],
        }),
    }),
});

export const { useGetMenuCategoriesQuery } = menuCategoriesApi;
