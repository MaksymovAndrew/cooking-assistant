import { useCallback, useState } from "react";

import type { Ingredient } from "types/ingredient";
import type { RecipeFormIngredient } from "types/recipeForm";

import { moveBefore } from "utils/listOrder";

export const useSelectedIngredients = () => {
    const [selectedIngredients, setSelectedIngredients] = useState<
        RecipeFormIngredient[]
    >([]);

    const toggleIngredientSelection = useCallback((ingredient: Ingredient) => {
        setSelectedIngredients((prev) => {
            const existing = prev.find((i) => i.id === ingredient.id);

            if (existing) {
                return prev.filter((i) => i.id !== ingredient.id);
            }

            return [
                ...prev,
                {
                    id: ingredient.id,
                    slug: ingredient.slug,
                    name: ingredient.name,
                    quantity: 1,
                    unit_name: ingredient.unit_name,
                    calories_per_unit: ingredient.calories_per_unit,
                },
            ];
        });
    }, []);

    const updateIngredientQuantity = useCallback(
        (ingredientId: number, quantity: number) => {
            setSelectedIngredients((prev) =>
                prev.map((ingredient) =>
                    ingredient.id === ingredientId
                        ? { ...ingredient, quantity: Math.max(quantity, 1) }
                        : ingredient,
                ),
            );
        },
        [],
    );

    const removeIngredient = useCallback((ingredientId: number) => {
        setSelectedIngredients((prev) =>
            prev.filter((ingredient) => ingredient.id !== ingredientId),
        );
    }, []);

    const reorderIngredients = useCallback((fromId: number, toId: number) => {
        setSelectedIngredients((prev) =>
            moveBefore(
                prev,
                prev.findIndex((i) => i.id === fromId),
                prev.findIndex((i) => i.id === toId),
            ),
        );
    }, []);

    return {
        selectedIngredients,
        setSelectedIngredients,
        toggleIngredientSelection,
        updateIngredientQuantity,
        removeIngredient,
        reorderIngredients,
    };
};
