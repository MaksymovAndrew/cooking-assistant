import type { RecipeDetailIngredient } from "types/recipe";

const NONE_ALLERGEN = "none";

// dedupes and drops null/"None" placeholder values from raw allergen lists
export const filterAllergens = (allergens: (string | null)[]): string[] => {
    const unique = new Set(
        allergens.filter(
            (allergen): allergen is string =>
                allergen !== null && allergen.toLowerCase() !== NONE_ALLERGEN,
        ),
    );

    return Array.from(unique);
};

export const getRecipeAllergens = (
    ingredients: RecipeDetailIngredient[],
): string[] =>
    filterAllergens(ingredients.map((ingredient) => ingredient.allergens));
