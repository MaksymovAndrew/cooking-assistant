import { useMemo } from "react";

import type { RecipeDetailIngredient } from "types/recipe";
import type { UserIngredient } from "types/userIngredient";

import { useGetUserIngredientsQuery } from "redux/services/userIngredientsApi";

export interface IngredientAvailability extends RecipeDetailIngredient {
    have: boolean;
}

// cross-references a recipe's ingredients against the current user's pantry,
// the same way the existing "missing ingredients for a menu" feature does
export const useIngredientAvailability = (
    ingredients: RecipeDetailIngredient[],
) => {
    const { data: pantry = [] } = useGetUserIngredientsQuery(null);

    const pantryIds = useMemo(
        () => new Set(pantry.map((item: UserIngredient) => item.ingredient_id)),
        [pantry],
    );

    const availability = useMemo<IngredientAvailability[]>(
        () =>
            ingredients.map((ingredient) => ({
                ...ingredient,
                have: pantryIds.has(ingredient.id),
            })),
        [ingredients, pantryIds],
    );

    const haveCount = availability.filter((item) => item.have).length;

    return {
        availability,
        haveCount,
        missingCount: availability.length - haveCount,
    };
};
