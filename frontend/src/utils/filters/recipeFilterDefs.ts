import { ALLERGEN_SLUGS, type AllergenSlug } from "constants/allergens";
import type { RecipeFilterParams } from "types/recipe";

import type { FilterDef } from "./filterDef";
import { idListFilter, textFilter } from "./filterDefFactories";
import {
    booleanFilter,
    enumFilter,
    enumListFilter,
} from "./filterDefFactories.scalar";
import { RECIPE_RANGE_FILTER_DEFS } from "./recipeFilterDefs.ranges";

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

// shared with links that pre-set the filter before navigating (see PantryRecipesCard)
export const RECIPE_PANTRY_URL_PARAM = "pantry";
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
    booleanFilter<RecipeFilterParams>({
        key: "inPantry",
        urlParam: RECIPE_PANTRY_URL_PARAM,
        param: "in_pantry",
        chipLabel: (_value, t) => t("filterPanel.inPantryChip"),
    }),
    booleanFilter<RecipeFilterParams>({
        key: "favourites",
        urlParam: "fav",
        param: "favourites",
        chipLabel: (_value, t) => t("filterPanel.favouritesChip"),
    }),
    booleanFilter<RecipeFilterParams>({
        key: "topRated",
        urlParam: "top",
        param: "top_rated",
        chipLabel: (_value, t) => t("filterPanel.topRatedChip"),
    }),
    enumListFilter<AllergenSlug, RecipeFilterParams>({
        key: "excludeAllergens",
        urlParam: "without",
        param: "exclude_allergens",
        values: ALLERGEN_SLUGS,
        chipLabel: (value, t) =>
            t("filterPanel.excludeAllergensChip", { count: value.length }),
    }),
    booleanFilter<RecipeFilterParams>({
        key: "hideAvoided",
        urlParam: "avoid",
        param: "hide_avoided",
        chipLabel: (_value, t) => t("filterPanel.hideAvoidedChip"),
    }),
    idListFilter<RecipeFilterParams>({
        key: "tags",
        urlParam: "tags",
        param: "tag_ids",
        chipLabel: (value, t) => t("tags:filter.chip", { count: value.length }),
    }),
];
