import type {
    CreateMenuRequest,
    Menu,
    MenuDetails,
    MenuListParams,
    UpdateMenuRequest,
} from "types/menu";
import type { PaginatedResult } from "types/pagination";
import type { MenuStatistics } from "types/stats";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";
import { infiniteListProvidesTags, listTag } from "./cacheTags";
import { offsetPagedQuery } from "./infiniteQueryHelpers";

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
            ...offsetPagedQuery(API_ROUTES.menu.list),
            providesTags: (result) => infiniteListProvidesTags(MENU, result),
        }),
        getMenusByPerson: build.infiniteQuery<
            PaginatedResult<Menu>,
            MenuListParams,
            number
        >({
            ...offsetPagedQuery(API_ROUTES.menu.byPerson),
            providesTags: (result) => infiniteListProvidesTags(MENU, result),
        }),
        getMenuStats: build.query<MenuStatistics, null>({
            query: () => ({ url: API_ROUTES.menu.stats }),
            providesTags: [MENU_LIST],
        }),
        getMenuById: build.query<MenuDetails, MenuId>({
            query: (id) => ({ url: API_ROUTES.menu.byId(id) }),
            providesTags: (_result, _error, id) => [{ type: MENU, id }],
        }),
        createMenu: build.mutation<{ menuId: number }, CreateMenuRequest>({
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
            // calorie_intake.menu_id is ON DELETE SET NULL, so cached intake logs go stale
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
    useGetMenuStatsQuery,
    useGetMenuByIdQuery,
    useCreateMenuMutation,
    useUpdateMenuMutation,
    useDeleteMenuMutation,
} = menusApi;
