import type { MenuDetailRecipe, MissingIngredient } from "types/menu";

export interface AggregatedIngredient {
    slug: string;
    name: string;
    quantity: number;
    missingQuantity: number;
    unit: string;
    sufficient: boolean;
}

// every ingredient used anywhere in the menu, not just what's missing - keyed by ingredient_id (not name) so it stays correct once ingredient names are translated
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

// a menu's calories are unknown as soon as one of its recipes' are - the server refuses to log them then
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
