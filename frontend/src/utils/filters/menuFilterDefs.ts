import type { MenuListParams } from "types/menu";

import type { FilterDef } from "./filterDef";
import { idListFilter, textFilter } from "./filterDefFactories";

export interface MenuFilterState {
    search: string;
    categories: number[];
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
];
