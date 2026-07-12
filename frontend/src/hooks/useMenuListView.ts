import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { SEARCH_PARAM_INGREDIENT_NAME } from "constants/queryParams";

import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectMenuFilters } from "redux/selectors/filtersSelectors";
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
import { setMenuSelectedCategories } from "redux/slices/filtersSlice";

import { buildMenuFilterParams } from "utils/menuFilterParams";
import { getQueryErrorMessage } from "utils/queryError";

export const MENU_SOURCE = {
    all: "all",
    person: "person",
} as const;

export type MenuSource = (typeof MENU_SOURCE)[keyof typeof MENU_SOURCE];

// view model for the two menu lists: the category filter comes from the store, the name search from the URL, the menus from RTK Query
export const useMenuListView = (source: MenuSource) => {
    const dispatch = useAppDispatch();
    const { selectedCategories } = useAppSelector(selectMenuFilters);
    const [searchParams, setSearchParams] = useSearchParams();
    // known quirk: the menu name search reuses the ingredient_name URL key
    const menuName = searchParams.get(SEARCH_PARAM_INGREDIENT_NAME);

    const params = useMemo(
        () => buildMenuFilterParams(selectedCategories, menuName),
        [selectedCategories, menuName],
    );

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
            selectedCategories.includes(category.menu_category_id),
        )
        .map((category) => category.category_name)
        .join(", ");

    const hasActiveFilters = Boolean(menuName) || selectedCategories.length > 0;
    const clearFilters = () => {
        setSearchParams({});
        dispatch(setMenuSelectedCategories([]));
    };
    const removeSearch = () => {
        setSearchParams({});
    };

    return {
        selectedCategories,
        setSelectedCategories: (next: number[]) =>
            dispatch(setMenuSelectedCategories(next)),
        categories,
        menus,
        currentUserId: currentUser?.id ?? null,
        noMenus: active.isSuccess && !hasLoadedMenus,
        error: !hasLoadedMenus ? errorMessage : null,
        selectedCategoryNames,
        searchQuery: menuName,
        hasActiveFilters,
        clearFilters,
        removeSearch,
        total,
        loadedCount: menus.length,
        hasNextPage: active.hasNextPage,
        isFetchingNextPage: active.isFetchingNextPage,
        fetchNextPage: active.fetchNextPage,
        loadMoreError: hasLoadedMenus ? errorMessage : null,
        refetch: active.refetch,
    };
};
