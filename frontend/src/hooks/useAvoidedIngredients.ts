import { useMemo } from "react";

import { useAppSelector } from "redux/hooks";
import { selectIsAuthed } from "redux/selectors/sessionSelectors";
import { useGetDietPreferencesQuery } from "redux/services/dietPreferencesApi";

interface AvoidableIngredient {
    id: number;
    allergens: string[];
}

export interface AvoidedIngredients {
    isAllergenAvoided: (allergen: string) => boolean;
    isIngredientAvoided: (ingredient: AvoidableIngredient) => boolean;
}

// what the viewer avoids, for marking rows on pages that already hold the ingredients; a guest avoids nothing
export const useAvoidedIngredients = (): AvoidedIngredients => {
    const isAuthed = useAppSelector(selectIsAuthed);
    const { data } = useGetDietPreferencesQuery(null, { skip: !isAuthed });

    return useMemo(() => {
        const allergens = new Set<string>(data?.allergens ?? []);
        const ingredientIds = new Set(data?.ingredient_ids ?? []);

        return {
            isAllergenAvoided: (allergen) => allergens.has(allergen),
            isIngredientAvoided: (ingredient) =>
                ingredientIds.has(ingredient.id) ||
                ingredient.allergens.some((allergen) =>
                    allergens.has(allergen),
                ),
        };
    }, [data]);
};
