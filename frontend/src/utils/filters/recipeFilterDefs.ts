import type { RecipeFilterParams } from "types/recipe";

import type { FilterDef } from "./filterDef";
import {
    idListFilter,
    numericRangeFilter,
    textFilter,
} from "./filterDefFactories";
import { booleanFilter, enumFilter } from "./filterDefFactories.scalar";

export interface RecipeFilterState {
    search: string;
    types: number[];
    ingredients: number[];
    cookingTime: { min: string; max: string };
    sort: "asc" | "desc" | null;
    inPantry: boolean;
}

// shared with links that pre-set the filter before navigating (see PantryRecipesCard)
export const RECIPE_PANTRY_URL_PARAM = "pantry";

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
        urlParam: "types",
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
    numericRangeFilter<RecipeFilterParams>({
        key: "cookingTime",
        urlParam: "time",
        minParam: "min_cooking_time",
        maxParam: "max_cooking_time",
        chipLabel: (value, t) => {
            if (value.min !== "" && value.max !== "") {
                return t("filterPanel.timeChipRange", {
                    min: value.min,
                    max: value.max,
                });
            }
            if (value.min !== "") {
                return t("filterPanel.timeChipMin", { minutes: value.min });
            }

            return t("filterPanel.timeChipMax", { minutes: value.max });
        },
    }),
    enumFilter<"asc" | "desc", RecipeFilterParams>({
        key: "sort",
        urlParam: "sort",
        param: "sort_order",
        values: ["asc", "desc"],
        chipLabel: (value, t) =>
            t("filterPanel.sortChip", {
                sort: t(
                    value === "asc"
                        ? "filterPanel.fastToLong"
                        : "filterPanel.longToFast",
                ),
            }),
    }),
    booleanFilter<RecipeFilterParams>({
        key: "inPantry",
        urlParam: RECIPE_PANTRY_URL_PARAM,
        param: "in_pantry",
        chipLabel: (_value, t) => t("filterPanel.inPantryChip"),
    }),
];
