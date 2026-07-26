import i18next from "i18next";

import type { Ingredient } from "types/ingredient";

import { resolveIngredientName } from "utils/ingredientName";

// sorts by the resolved display name, in the active i18n locale
export const sortIngredientsByName = (
    ingredients: Ingredient[],
): Ingredient[] =>
    [...ingredients].sort((a, b) =>
        resolveIngredientName(a).localeCompare(
            resolveIngredientName(b),
            i18next.language,
        ),
    );
