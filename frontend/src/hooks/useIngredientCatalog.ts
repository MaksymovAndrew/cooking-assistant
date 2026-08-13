import { useMemo, useState } from "react";

import type { PantryIngredient } from "types/userIngredient";

import { useGetIngredientsQuery } from "redux/services/ingredientsApi";
import {
    useGetUserIngredientsQuery,
    useSaveUserIngredientMutation,
} from "redux/services/userIngredientsApi";

import { sortIngredientsByName } from "utils/sortIngredientsByName";

// pantry view model: data comes from RTK Query (the Pantry tag refetches the list after every write), the editing/selection state stays local UI state
export const useIngredientCatalog = () => {
    const { data: rawAllIngredients } = useGetIngredientsQuery(null);
    const { data: rawUserIngredients } = useGetUserIngredientsQuery(null);
    const [saveUserIngredient] = useSaveUserIngredientMutation();

    const allIngredients = useMemo(
        () => sortIngredientsByName(rawAllIngredients ?? []),
        [rawAllIngredients],
    );
    const personIngredients = useMemo<PantryIngredient[]>(
        () =>
            (rawUserIngredients ?? []).map((item) => ({
                ...item,
                id: item.ingredient_id,
                slug: item.ingredient_slug,
            })),
        [rawUserIngredients],
    );

    const [selectedIngredients, setSelectedIngredients] = useState<number[]>(
        [],
    );
    const [isAdding, setIsAdding] = useState(false);

    const toggleIngredientSelection = (ingredientId: number) => {
        setSelectedIngredients((prev) =>
            prev.includes(ingredientId)
                ? prev.filter((id) => id !== ingredientId)
                : [...prev, ingredientId],
        );
    };

    const handleOpenAddModal = () => {
        setSelectedIngredients([]);
        setIsAdding(true);
    };

    const handleCancelAdd = () => {
        setSelectedIngredients([]);
        setIsAdding(false);
    };

    const handleConfirmAddIngredients = async (
        quantities: Record<number, number>,
    ) => {
        const newIngredients = allIngredients
            .filter((ingredient) => selectedIngredients.includes(ingredient.id))
            .map((ingredient) => ({
                id: ingredient.id,
                ingredient_name: ingredient.name,
                quantity_person_ingradient: quantities[ingredient.id] ?? 1,
            }));

        // a failed mutation is already toasted by the global listener
        const result = await saveUserIngredient({
            ingredients: newIngredients,
        });

        if ("data" in result) {
            setSelectedIngredients([]);
            setIsAdding(false);
        }
    };

    return {
        allIngredients,
        personIngredients,
        selectedIngredients,
        toggleIngredientSelection,
        isAdding,
        handleOpenAddModal,
        handleCancelAdd,
        handleConfirmAddIngredients,
    };
};
