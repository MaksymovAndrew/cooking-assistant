import type { TFunction } from "i18next";

import type { MenuDetailRecipe, MenuDetails } from "types/menu";
import type { RecipeDetails } from "types/recipe";

import { resolveIngredientName } from "utils/ingredientName";

// the browser loads the ingredient catalog after the first paint, and resolveIngredientName falls back to the record's
// own name until then; a server-rendered record already carrying the translated name looks the same before and after
export const localizeRecipeIngredients = (
    t: TFunction,
    recipe: RecipeDetails,
): RecipeDetails => ({
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        name: resolveIngredientName(t, ingredient),
    })),
});

const localizeMissingIngredients = (
    t: TFunction,
    recipe: MenuDetailRecipe,
): MenuDetailRecipe => ({
    ...recipe,
    missingIngredients: recipe.missingIngredients?.map((ingredient) => ({
        ...ingredient,
        ingredient_name: resolveIngredientName(t, {
            slug: ingredient.ingredient_slug,
            name: ingredient.ingredient_name,
        }),
    })),
});

export const localizeMenuIngredients = (
    t: TFunction,
    menu: MenuDetails,
): MenuDetails => ({
    ...menu,
    recipes: menu.recipes.map((recipe) =>
        localizeMissingIngredients(t, recipe),
    ),
});
