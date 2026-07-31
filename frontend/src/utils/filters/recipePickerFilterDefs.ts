import type { RecipeListItem } from "types/recipe";

import type { ClientFilterDef } from "utils/filters/clientFilterDef";

export interface RecipePickerFilterState {
    query: string;
}

// excluding already-selected recipes stays outside the registry, same reasoning as
// matchIngredientIds staying outside RECIPE_FILTER_DEFS: it's driven by the selectedIds
// prop, not by a value the user sets through this filter UI
const queryFilter: ClientFilterDef<RecipeListItem, string> = {
    key: "query",
    defaultValue: "",
    isActive: (value) => value.trim() !== "",
    predicate: (item, value) =>
        item.title.toLowerCase().includes(value.trim().toLowerCase()),
};

export const RECIPE_PICKER_FILTER_DEFS: readonly ClientFilterDef<
    RecipeListItem,
    unknown
>[] = [queryFilter];
