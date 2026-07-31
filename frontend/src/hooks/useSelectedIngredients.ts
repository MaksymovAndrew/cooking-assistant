import { useCallback, useState } from "react";

import type { Ingredient } from "types/ingredient";
import type { RecipeFormIngredient } from "types/recipe";

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
        setSelectedIngredients((prev) => {
            const fromIndex = prev.findIndex((i) => i.id === fromId);
            const toIndex = prev.findIndex((i) => i.id === toId);
            const isNoOpReorder =
                fromIndex === -1 || toIndex === -1 || fromIndex === toIndex;

            if (isNoOpReorder) {
                return prev;
            }

            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            // removing `moved` shifts every later index left by one, so a forward move must
            // land one slot earlier than the target's pre-removal index or it overshoots past
            // the drop target instead of landing right before it
            const insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex;

            next.splice(insertAt, 0, moved);

            return next;
        });
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
