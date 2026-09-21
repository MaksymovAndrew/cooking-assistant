import type { MenuListParams } from "types/menu";

import type { FilterDef } from "./filterDef";
import { idListFilter, textFilter } from "./filterDefFactories";
import { booleanFilter, enumFilter } from "./filterDefFactories.scalar";

export interface MenuFilterState {
    search: string;
    categories: number[];
    favourites: boolean;
    topRated: boolean;
    // menus have one sort besides the default newest-first
    sort: "rating" | null;
}

// shared with links that pre-set the filter before navigating (see GuestLandingMenuFilters)
export const MENU_CATEGORY_URL_PARAM = "cats";

export const MENU_FILTER_DEFS: readonly FilterDef<unknown, MenuListParams>[] = [
    textFilter<MenuListParams>({
        key: "search",
        urlParam: "q",
        param: "menu_name",
        chipLabel: (value, t) =>
            t("categoryFilter.searchChip", { query: value }),
    }),
    idListFilter<MenuListParams>({
        key: "categories",
        urlParam: MENU_CATEGORY_URL_PARAM,
        param: "category_ids",
        chipLabel: (value, t) =>
            t("categoryFilter.categoryChip", { count: value.length }),
    }),
    booleanFilter<MenuListParams>({
        key: "favourites",
        urlParam: "fav",
        param: "favourites",
        chipLabel: (_value, t) => t("categoryFilter.favouritesChip"),
    }),
    booleanFilter<MenuListParams>({
        key: "topRated",
        urlParam: "top",
        param: "top_rated",
        chipLabel: (_value, t) => t("categoryFilter.topRatedChip"),
    }),
    enumFilter<"rating", MenuListParams>({
        key: "sort",
        urlParam: "sort",
        param: "sort_order",
        values: ["rating"],
        chipLabel: (_value, t) => t("categoryFilter.sortByRatingChip"),
    }),
];
