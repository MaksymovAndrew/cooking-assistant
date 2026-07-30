import type { MenuListParams } from "types/menu";

import type { FilterDef } from "./filterDef";
import { idListFilter, textFilter } from "./filterDefFactories";

export interface MenuFilterState {
    search: string;
    categories: number[];
}

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
        urlParam: "cats",
        param: "category_ids",
    }),
];
