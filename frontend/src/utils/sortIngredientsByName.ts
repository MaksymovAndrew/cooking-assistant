import type { TFunction } from "i18next";

import {
    type ResolvableIngredient,
    resolveIngredientName,
} from "utils/ingredientName";

export const sortIngredientsByName = <T extends ResolvableIngredient>(
    ingredients: readonly T[],
    t: TFunction,
    locale: string,
): T[] =>
    [...ingredients].sort((a, b) =>
        resolveIngredientName(t, a).localeCompare(
            resolveIngredientName(t, b),
            locale,
        ),
    );
