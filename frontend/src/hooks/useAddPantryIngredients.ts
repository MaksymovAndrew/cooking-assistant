import { useState } from "react";

import type { Ingredient } from "types/ingredient";

import { useSaveUserIngredientMutation } from "redux/services/userIngredientsApi";

const DEFAULT_QUANTITY = 1;

export const useAddPantryIngredients = (
    allIngredients: readonly Ingredient[],
    onSaved: () => void,
) => {
    const [saveUserIngredient] = useSaveUserIngredientMutation();
    const [selectedIngredients, setSelectedIngredients] = useState<number[]>(
        [],
    );

    const toggleIngredientSelection = (ingredientId: number) => {
        setSelectedIngredients((prev) =>
            prev.includes(ingredientId)
                ? prev.filter((id) => id !== ingredientId)
                : [...prev, ingredientId],
        );
    };

    const confirm = async (quantities: Record<number, number>) => {
        const ingredients = allIngredients
            .filter((ingredient) => selectedIngredients.includes(ingredient.id))
            .map((ingredient) => ({
                id: ingredient.id,
                ingredient_name: ingredient.name,
                quantity_person_ingradient:
                    quantities[ingredient.id] ?? DEFAULT_QUANTITY,
            }));

        // a failed mutation is already toasted by the global listener
        const result = await saveUserIngredient({ ingredients });

        if ("data" in result) {
            onSaved();
        }
    };

    return { selectedIngredients, toggleIngredientSelection, confirm };
};
