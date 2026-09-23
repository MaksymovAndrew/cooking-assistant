import type { RecipeFilterParams } from "types/recipe";

import type { FilterDef } from "./filterDef";
import { numericRangeFilter } from "./filterDefFactories.range";

// cooking time and calories: the two numeric ranges the recipe list exposes
export const RECIPE_RANGE_FILTER_DEFS: readonly FilterDef<
    unknown,
    RecipeFilterParams
>[] = [
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
    numericRangeFilter<RecipeFilterParams>({
        key: "calories",
        urlParam: "kcal",
        minParam: "min_calories",
        maxParam: "max_calories",
        chipLabel: (value, t) => {
            if (value.min !== "" && value.max !== "") {
                return t("filterPanel.caloriesChipRange", {
                    min: value.min,
                    max: value.max,
                });
            }
            if (value.min !== "") {
                return t("filterPanel.caloriesChipMin", { kcal: value.min });
            }

            return t("filterPanel.caloriesChipMax", { kcal: value.max });
        },
    }),
];
