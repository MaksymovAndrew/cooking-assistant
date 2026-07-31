import { useMemo } from "react";

import type { MenuListParams } from "types/menu";

import { useGetMeQuery } from "redux/services/authApi";
import {
    flattenPages,
    getPaginatedTotal,
} from "redux/services/infiniteQueryHelpers";
import { useGetMenuCategoriesQuery } from "redux/services/menuCategoriesApi";
import {
    useGetMenusByPersonInfiniteQuery,
    useGetMenusInfiniteQuery,
} from "redux/services/menusApi";

import type { MenuFilterState } from "utils/filters/menuFilterDefs";
import { MENU_FILTER_DEFS } from "utils/filters/menuFilterDefs";
import { getQueryErrorMessage } from "utils/queryError";

import { useListFilters } from "./useListFilters";

export type { MenuFilterState } from "utils/filters/menuFilterDefs";

export const MENU_SOURCE = {
    all: "all",
    person: "person",
} as const;

export type MenuSource = (typeof MENU_SOURCE)[keyof typeof MENU_SOURCE];

// view model for the two menu lists: the URL is the single source of truth for
// filters, pages come from RTK Query's infiniteQuery
export const useMenuListView = (source: MenuSource) => {
    const {
        values: filters,
        setValue,
        reset: resetFilters,
        params,
        activeFilters,
        activeCount,
        hasActiveFilters,
    } = useListFilters<MenuFilterState, MenuListParams>(MENU_FILTER_DEFS);

    const isPerson = source === MENU_SOURCE.person;
    const all = useGetMenusInfiniteQuery(params, { skip: isPerson });
    const byPerson = useGetMenusByPersonInfiniteQuery(params, {
        skip: !isPerson,
    });
    const active = isPerson ? byPerson : all;

    // already fetched by PrivateRoute on mount, so this is a cache read, not a new request - used to flag the current user's own menus in the "all" list
    const { data: currentUser } = useGetMeQuery(null);
    const { data: categories = [] } = useGetMenuCategoriesQuery(null);
    const menus = useMemo(() => flattenPages(active.data), [active.data]);
    const total = getPaginatedTotal(active.data);
    const hasLoadedMenus = menus.length > 0;
    const errorMessage = active.isError
        ? getQueryErrorMessage(active.error)
        : null;

    const selectedCategoryNames = categories
        .filter((category) =>
            filters.categories.includes(category.menu_category_id),
        )
        .map((category) => category.category_name)
        .join(", ");

    return {
        filters,
        setValue,
        resetFilters,
        activeFilters,
        activeCount,
        hasActiveFilters,
        categories,
        menus,
        currentUserId: currentUser?.id ?? null,
        noMenus: active.isSuccess && !hasLoadedMenus,
        error: !hasLoadedMenus ? errorMessage : null,
        selectedCategoryNames,
        total,
        loadedCount: menus.length,
        hasNextPage: active.hasNextPage,
        isFetchingNextPage: active.isFetchingNextPage,
        fetchNextPage: active.fetchNextPage,
        loadMoreError: hasLoadedMenus ? errorMessage : null,
        refetch: active.refetch,
    };
};
