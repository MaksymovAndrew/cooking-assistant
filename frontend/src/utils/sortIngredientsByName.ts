import type { TFunction } from "i18next";

import type { Ingredient } from "types/ingredient";

import { resolveIngredientName } from "utils/ingredientName";

// sorts by the resolved display name, in the page's language
export const sortIngredientsByName = (
    ingredients: Ingredient[],
    t: TFunction,
    locale: string,
): Ingredient[] =>
    [...ingredients].sort((a, b) =>
        resolveIngredientName(t, a).localeCompare(
            resolveIngredientName(t, b),
            locale,
        ),
    );
