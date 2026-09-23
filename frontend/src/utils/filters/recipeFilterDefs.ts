import type { AllergenSlug } from "constants/allergens";
import type { RecipeFilterParams } from "types/recipe";

import type { FilterDef } from "./filterDef";
import { idListFilter, textFilter } from "./filterDefFactories";
import { enumFilter } from "./filterDefFactories.enum";
import { RECIPE_RANGE_FILTER_DEFS } from "./recipeFilterDefs.ranges";
import { RECIPE_TOGGLE_FILTER_DEFS } from "./recipeFilterDefs.toggles";

export type RecipeSort = "asc" | "desc" | "rating";

const SORT_CHIP_KEYS = {
    asc: "filterPanel.fastToLong",
    desc: "filterPanel.longToFast",
    rating: "filterPanel.topRated",
} as const satisfies Record<RecipeSort, string>;

export interface RecipeFilterState {
    search: string;
    types: number[];
    ingredients: number[];
    cookingTime: { min: string; max: string };
    calories: { min: string; max: string };
    sort: RecipeSort | null;
    inPantry: boolean;
    favourites: boolean;
    topRated: boolean;
    excludeAllergens: AllergenSlug[];
    hideAvoided: boolean;
    tags: number[];
}

// shared with links that pre-set the filter before navigating (see GuestLandingRecipeFilters)
export const RECIPE_TYPE_URL_PARAM = "types";

export const RECIPE_FILTER_DEFS: readonly FilterDef<
    unknown,
    RecipeFilterParams
>[] = [
    textFilter<RecipeFilterParams>({
        key: "search",
        urlParam: "q",
        param: "recipe_name",
        chipLabel: (value, t) => t("filterPanel.searchChip", { query: value }),
    }),
    idListFilter<RecipeFilterParams>({
        key: "types",
        urlParam: RECIPE_TYPE_URL_PARAM,
        param: "type_ids",
        chipLabel: (value, t) =>
            t("filterPanel.typeChip", { count: value.length }),
    }),
    idListFilter<RecipeFilterParams>({
        key: "ingredients",
        urlParam: "ingredients",
        param: "ingredient_ids",
        chipLabel: (value, t) =>
            t("filterPanel.ingredientsChip", { count: value.length }),
    }),
    ...RECIPE_RANGE_FILTER_DEFS,
    enumFilter<RecipeSort, RecipeFilterParams>({
        key: "sort",
        urlParam: "sort",
        param: "sort_order",
        values: ["asc", "desc", "rating"],
        chipLabel: (value, t) =>
            t("filterPanel.sortChip", {
                sort: t(SORT_CHIP_KEYS[value ?? "asc"]),
            }),
    }),
    ...RECIPE_TOGGLE_FILTER_DEFS,
    idListFilter<RecipeFilterParams>({
        key: "tags",
        urlParam: "tags",
        param: "tag_ids",
        chipLabel: (value, t) => t("tags:filter.chip", { count: value.length }),
    }),
];
