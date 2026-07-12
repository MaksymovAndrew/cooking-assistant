import type { Ingredient } from "types/ingredient";

// the recipe form sorts with the uk locale, the pantry with the default locale
export const sortIngredientsByName = (
    ingredients: Ingredient[],
    locale?: string,
): Ingredient[] =>
    [...ingredients].sort((a, b) => a.name.localeCompare(b.name, locale));
