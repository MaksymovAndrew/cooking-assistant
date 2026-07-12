import type { MenuDetailRecipe, MissingIngredient } from "types/menu";

export interface AggregatedIngredient {
    quantity: number;
    missingQuantity: number;
    unit: string;
    sufficient: boolean;
}

export const groupRecipesByType = (
    recipes: MenuDetailRecipe[],
): Record<string, MenuDetailRecipe[]> =>
    recipes.reduce((groups: Record<string, MenuDetailRecipe[]>, recipe) => {
        const { type_name } = recipe;

        if (!(type_name in groups)) {
            groups[type_name] = [];
        }
        groups[type_name].push(recipe);

        return groups;
    }, {});

// every ingredient used anywhere in the menu, not just what's missing - "sufficient" is the pantry covering the summed need across all recipes
export const aggregateMenuIngredients = (
    recipes: MenuDetailRecipe[],
): Record<string, AggregatedIngredient> =>
    recipes
        .flatMap((recipe) => recipe.missingIngredients ?? [])
        .reduce(
            (
                acc: Record<string, AggregatedIngredient>,
                ingredient: MissingIngredient,
            ) => {
                const {
                    ingredient_name,
                    needed_quantity,
                    missing_quantity,
                    unit_name,
                } = ingredient;

                if (!(ingredient_name in acc)) {
                    acc[ingredient_name] = {
                        quantity: needed_quantity,
                        missingQuantity: missing_quantity,
                        unit: unit_name,
                        sufficient: missing_quantity === 0,
                    };
                } else {
                    acc[ingredient_name].quantity += needed_quantity;
                    acc[ingredient_name].missingQuantity += missing_quantity;
                    acc[ingredient_name].sufficient =
                        acc[ingredient_name].missingQuantity === 0;
                }

                return acc;
            },
            {},
        );
