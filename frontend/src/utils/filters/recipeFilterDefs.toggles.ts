import { ALLERGEN_SLUGS, type AllergenSlug } from "constants/allergens";
import type { RecipeFilterParams } from "types/recipe";

import type { FilterDef } from "./filterDef";
import { enumListFilter } from "./filterDefFactories.enum";
import { booleanFilter } from "./filterDefFactories.scalar";

// shared with links that pre-set the filter before navigating (see PantryRecipesCard)
export const RECIPE_PANTRY_URL_PARAM = "pantry";

// the on/off refinements of the recipe filter popover, in chip order
export const RECIPE_TOGGLE_FILTER_DEFS: readonly FilterDef<
    unknown,
    RecipeFilterParams
>[] = [
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
];
