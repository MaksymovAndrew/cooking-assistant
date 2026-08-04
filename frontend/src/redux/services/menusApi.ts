import { PAGE_SIZE } from "constants/pagination";
import type {
    CreateMenuRequest,
    Menu,
    MenuDetails,
    MenuListParams,
    MenuWithStats,
    UpdateMenuRequest,
} from "types/menu";
import type { PaginatedResult } from "types/pagination";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";
import {
    infiniteListProvidesTags,
    listProvidesTags,
    listTag,
} from "./cacheTags";
import { getNextOffsetParam } from "./infiniteQueryHelpers";

const MENU = "Menu" as const;
const MENU_LIST = listTag(MENU);

type MenuId = string | number;

export const menusApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getMenus: build.infiniteQuery<
            PaginatedResult<Menu>,
            MenuListParams,
            number
        >({
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: getNextOffsetParam,
            },
            query: ({ queryArg, pageParam }) => ({
                url: API_ROUTES.menu.list,
                params: { ...queryArg, limit: PAGE_SIZE, offset: pageParam },
            }),
            providesTags: (result) => infiniteListProvidesTags(MENU, result),
        }),
        getMenusByPerson: build.infiniteQuery<
            PaginatedResult<Menu>,
            MenuListParams,
            number
        >({
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: getNextOffsetParam,
            },
            query: ({ queryArg, pageParam }) => ({
                url: API_ROUTES.menu.byPerson,
                params: { ...queryArg, limit: PAGE_SIZE, offset: pageParam },
            }),
            providesTags: (result) => infiniteListProvidesTags(MENU, result),
        }),
        getAllMenus: build.query<MenuWithStats[], null>({
            query: () => ({ url: API_ROUTES.menu.allUnpaginated }),
            providesTags: (result) => listProvidesTags(MENU, result),
        }),
        getMenuById: build.query<MenuDetails, MenuId>({
            query: (id) => ({ url: API_ROUTES.menu.byId(id) }),
            providesTags: (_result, _error, id) => [{ type: MENU, id }],
        }),
        createMenu: build.mutation<null, CreateMenuRequest>({
            query: (data) => ({
                url: API_ROUTES.menu.create,
                method: "POST",
                data,
            }),
            invalidatesTags: [MENU_LIST],
        }),
        updateMenu: build.mutation<
            null,
            { id: MenuId; data: UpdateMenuRequest }
        >({
            query: ({ id, data }) => ({
                url: API_ROUTES.menu.byId(id),
                method: "PUT",
                data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: MENU, id },
                MENU_LIST,
            ],
        }),
        deleteMenu: build.mutation<null, MenuId>({
            query: (id) => ({
                url: API_ROUTES.menu.byId(id),
                method: "DELETE",
            }),
            // the backend cascades the delete into calorie_intake.menu_id (ON DELETE SET NULL),
            // so any cached intake log holding an entry logged against this menu goes stale -
            // same reasoning as recipesApi's deleteRecipe
            invalidatesTags: (_result, _error, id) => [
                { type: MENU, id },
                MENU_LIST,
                "Calories",
            ],
        }),
    }),
});

export const {
    useGetMenusInfiniteQuery,
    useGetMenusByPersonInfiniteQuery,
    useGetAllMenusQuery,
    useGetMenuByIdQuery,
    useCreateMenuMutation,
    useUpdateMenuMutation,
    useDeleteMenuMutation,
} = menusApi;
