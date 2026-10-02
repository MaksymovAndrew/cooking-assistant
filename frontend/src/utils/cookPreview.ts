import type { MenuDetailRecipe } from "types/menu";
import type { CookRequirement } from "types/pantryConsumption";
import type { RecipeDetailIngredient } from "types/recipe";
import type { UserIngredient } from "types/userIngredient";

export type CookPreviewStatus = "full" | "partial" | "missing";

export interface CookPreviewLine extends CookRequirement {
    needed: number;
    available: number;
    status: CookPreviewStatus;
}

// the server compares in thousandths, so the preview does too - 0.1 + 0.2 must cover a need of 0.3
const QUANTITY_SCALE = 1000;

const toThousandths = (quantity: number): number =>
    Math.round(quantity * QUANTITY_SCALE) / QUANTITY_SCALE;

export const recipeCookRequirements = (
    ingredients: RecipeDetailIngredient[],
): CookRequirement[] =>
    ingredients.map((ingredient) => ({
        ingredient_id: ingredient.id,
        slug: ingredient.slug,
        name: ingredient.name,
        unit_name: ingredient.unit_name,
        quantity: ingredient.quantity_recipe_ingredients,
    }));

// a menu cooks each of its recipes once, so a recipe listed twice is counted once, as on the server
export const menuCookRequirements = (
    recipes: MenuDetailRecipe[],
): CookRequirement[] => {
    const seenRecipes = new Set<number>();
    const byIngredient = new Map<number, CookRequirement>();

    for (const recipe of recipes) {
        if (seenRecipes.has(recipe.recipe_id)) {
            continue;
        }

        seenRecipes.add(recipe.recipe_id);

        for (const ingredient of recipe.missingIngredients ?? []) {
            const current = byIngredient.get(ingredient.ingredient_id);

            byIngredient.set(ingredient.ingredient_id, {
                ingredient_id: ingredient.ingredient_id,
                slug: ingredient.ingredient_slug,
                name: ingredient.ingredient_name,
                unit_name: ingredient.unit_name,
                quantity: (current?.quantity ?? 0) + ingredient.needed_quantity,
            });
        }
    }

    return [...byIngredient.values()];
};

// cooking takes from the purchase lots, so that is what counts as available
const availableIn = (pantryItem: UserIngredient | undefined): number =>
    toThousandths(
        (pantryItem?.lots ?? []).reduce(
            (total, lot) => total + lot.quantity,
            0,
        ),
    );

const statusOf = (needed: number, available: number): CookPreviewStatus => {
    if (available <= 0) {
        return "missing";
    }

    return available >= needed ? "full" : "partial";
};

export const buildCookPreview = (
    requirements: CookRequirement[],
    pantry: UserIngredient[],
    portions: number,
): CookPreviewLine[] => {
    const pantryById = new Map(
        pantry.map((item) => [item.ingredient_id, item]),
    );

    return requirements.map((requirement) => {
        const needed = toThousandths(requirement.quantity * portions);
        const available = availableIn(
            pantryById.get(requirement.ingredient_id),
        );

        return {
            ...requirement,
            needed,
            available,
            status: statusOf(needed, available),
        };
    });
};
