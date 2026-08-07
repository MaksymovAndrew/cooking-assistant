import { useMemo } from "react";

import type { RecipeDetailIngredient } from "types/recipe";
import type { UserIngredient } from "types/userIngredient";

import { useAppSelector } from "redux/hooks";
import { selectIsAuthed } from "redux/selectors/sessionSelectors";
import { useGetUserIngredientsQuery } from "redux/services/userIngredientsApi";

export interface IngredientAvailability extends RecipeDetailIngredient {
    have: boolean;
}

// cross-references a recipe's ingredients against the current user's pantry, the same way the
// existing "missing ingredients for a menu" feature does - skipped until the session is
// confirmed authed (recipe detail is public now, and an anonymous or not-yet-checked visitor has
// no pantry to check against - firing early would 401 during the initial checking window)
export const useIngredientAvailability = (
    ingredients: RecipeDetailIngredient[],
) => {
    const isAuthed = useAppSelector(selectIsAuthed);
    const { data: pantry = [] } = useGetUserIngredientsQuery(null, {
        skip: !isAuthed,
    });

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
