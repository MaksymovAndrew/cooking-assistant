import { useMemo } from "react";

import type { RecipeDetailIngredient } from "types/recipe";
import type { UserIngredient } from "types/userIngredient";

import { useAppSelector } from "redux/hooks";
import { selectIsAuthed } from "redux/selectors/sessionSelectors";
import { useGetUserIngredientsQuery } from "redux/services/userIngredientsApi";

export interface IngredientAvailability extends RecipeDetailIngredient {
    have: boolean;
}

// skipped until authed: firing during the session check would 401 and trip the auth redirect
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
