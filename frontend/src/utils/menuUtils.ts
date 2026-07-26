import type { MenuDetailRecipe, MissingIngredient } from "types/menu";

export interface AggregatedIngredient {
    slug: string;
    name: string;
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
// keyed by ingredient_id (not name) so it stays correct once ingredient names are translated
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
