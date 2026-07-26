import type { RecipeDetailIngredient } from "types/recipe";

// dedupes a flat list of allergen slugs
export const filterAllergens = (allergens: string[]): string[] =>
    Array.from(new Set(allergens));

export const getRecipeAllergens = (
    ingredients: RecipeDetailIngredient[],
): string[] =>
    filterAllergens(ingredients.flatMap((ingredient) => ingredient.allergens));
