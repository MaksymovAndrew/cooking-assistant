import type { MenuDetailRecipe, MissingIngredient } from "types/menu";
import type { ShoppingListIngredientEntry } from "types/shoppingList";

import { roundQuantity } from "utils/roundQuantity";
import { sumBy } from "utils/sum";

export interface AggregatedIngredient {
    slug: string;
    name: string;
    quantity: number;
    missingQuantity: number;
    unit: string;
    sufficient: boolean;
}

// every ingredient of the menu despite the field name; keyed by id, since names get translated
export const aggregateMenuIngredients = (
    recipes: MenuDetailRecipe[],
): Record<number, AggregatedIngredient> =>
    recipes
        .flatMap((recipe) => recipe.missingIngredients ?? [])
        .reduce(
            (
                acc: Record<number, AggregatedIngredient>,
                ingredient: MissingIngredient,
            ) => {
                const {
                    ingredient_id,
                    ingredient_slug,
                    ingredient_name,
                    needed_quantity,
                    missing_quantity,
                    unit_name,
                } = ingredient;

                if (!(ingredient_id in acc)) {
                    acc[ingredient_id] = {
                        slug: ingredient_slug,
                        name: ingredient_name,
                        quantity: needed_quantity,
                        missingQuantity: missing_quantity,
                        unit: unit_name,
                        sufficient: missing_quantity === 0,
                    };
                } else {
                    acc[ingredient_id].quantity += needed_quantity;
                    acc[ingredient_id].missingQuantity += missing_quantity;
                    acc[ingredient_id].sufficient =
                        acc[ingredient_id].missingQuantity === 0;
                }

                return acc;
            },
            {},
        );

// unknown as soon as one recipe's are, and the server then refuses to log them
export const menuCaloriesPerPortion = (
    recipes: MenuDetailRecipe[],
): number | null => {
    if (recipes.length === 0) {
        return null;
    }

    let total = 0;

    for (const recipe of recipes) {
        if (recipe.calories_per_portion === null) {
            return null;
        }

        total += recipe.calories_per_portion;
    }

    return total;
};

export const menuTotalCookingTime = (recipes: MenuDetailRecipe[]): number =>
    sumBy(recipes, (recipe) => recipe.cooking_time);

export const countMissingIngredients = (
    ingredients: Record<number, AggregatedIngredient>,
): number =>
    Object.values(ingredients).filter((ingredient) => !ingredient.sufficient)
        .length;

// only the shortfall goes on the shopping list, not the whole amount the menu needs
export const missingShoppingItems = (
    ingredients: Record<number, AggregatedIngredient>,
): ShoppingListIngredientEntry[] =>
    Object.entries(ingredients)
        .filter(([, ingredient]) => !ingredient.sufficient)
        .map(([id, ingredient]) => ({
            ingredient_id: Number(id),
            quantity: roundQuantity(ingredient.missingQuantity),
        }));
