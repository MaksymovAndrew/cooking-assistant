import { useMemo } from "react";

import type { MenuListParams } from "types/menu";

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
import { useViewerFilterGate } from "./useViewerFilterGate";

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
        setValues,
        reset: resetFilters,
        params,
        activeFilters,
        activeCount,
        hasActiveFilters,
    } = useListFilters<MenuFilterState, MenuListParams>(MENU_FILTER_DEFS);

    // the favourites toggle is hidden for a guest; a stale ?fav=1 (a bookmark, an expired session) is
    // dropped here instead of sending a request the backend rejects with a 400
    const { isAuthed, isAwaitingSession } = useViewerFilterGate(
        filters.favourites,
    );
    const queryParams = isAuthed
        ? params
        : { ...params, favourites: undefined };
    const isPerson = source === MENU_SOURCE.person;
    const all = useGetMenusInfiniteQuery(queryParams, {
        skip: isPerson || isAwaitingSession,
    });
    const byPerson = useGetMenusByPersonInfiniteQuery(queryParams, {
        skip: !isPerson || isAwaitingSession,
    });
    const active = isPerson ? byPerson : all;

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
        setValues,
        resetFilters,
        activeFilters,
        activeCount,
        hasActiveFilters,
        categories,
        menus,
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
