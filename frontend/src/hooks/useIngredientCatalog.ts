import { useEffect, useMemo, useState } from "react";

import type { PantryIngredient } from "types/userIngredient";

import { useGetIngredientsQuery } from "redux/services/ingredientsApi";
import {
    useGetUserIngredientsQuery,
    useSaveUserIngredientMutation,
    useUpdateQuantitiesMutation,
} from "redux/services/userIngredientsApi";

import { sortIngredientsByName } from "utils/sortIngredientsByName";

const todayIso = () => new Date().toISOString().split("T")[0];

// pantry view model: data comes from RTK Query (the Pantry tag refetches the
// list after every write), the editing/selection state stays local UI state
export const useIngredientCatalog = () => {
    const { data: rawAllIngredients } = useGetIngredientsQuery(null);
    const { data: rawUserIngredients } = useGetUserIngredientsQuery(null);
    const [saveUserIngredient] = useSaveUserIngredientMutation();
    const [updateQuantities] = useUpdateQuantitiesMutation();

    const allIngredients = useMemo(
        () => sortIngredientsByName(rawAllIngredients ?? []),
        [rawAllIngredients],
    );
    const personIngredients = useMemo<PantryIngredient[]>(
        () =>
            (rawUserIngredients ?? []).map((item) => ({
                ...item,
                id: item.ingredient_id,
            })),
        [rawUserIngredients],
    );

    const [selectedIngredients, setSelectedIngredients] = useState<number[]>(
        [],
    );
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingQuantity, setIsEditingQuantity] = useState(false);
    const [updatedIngredients, setUpdatedIngredients] = useState<
        PantryIngredient[]
    >([]);

    // re-seed the selection from the pantry whenever the cached list changes
    useEffect(() => {
        setSelectedIngredients(personIngredients.map((item) => item.id));
    }, [personIngredients]);

    const toggleIngredientSelection = (ingredientId: number) => {
        setSelectedIngredients((prev) =>
            prev.includes(ingredientId)
                ? prev.filter((id) => id !== ingredientId)
                : [...prev, ingredientId],
        );
    };

    const handleSaveOrToggleEdit = async () => {
        if (!isEditing) {
            setIsEditing(true);

            return;
        }

        const newIngredients = allIngredients
            .filter(
                (ingredient) =>
                    selectedIngredients.includes(ingredient.id) &&
                    !personIngredients.some(
                        (item) => item.id === ingredient.id,
                    ),
            )
            .map((ingredient) => ({
                id: ingredient.id,
                ingredient_name: ingredient.name,
                quantity_person_ingradient: 1,
            }));

        // a failed mutation is already toasted by the global listener
        const result = await saveUserIngredient({
            ingredients: newIngredients,
        });

        if ("data" in result) {
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setSelectedIngredients(personIngredients.map((item) => item.id));
        setIsEditing(false);
    };

    const handleToggleQuantityEdit = () => {
        setUpdatedIngredients(personIngredients.map((item) => ({ ...item })));
        setIsEditingQuantity(true);
        setIsEditing(false);
    };

    const handleQuantityChange = (id: number, newQuantity: number) => {
        setUpdatedIngredients((prev) =>
            prev.map((ingredient) => {
                if (ingredient.id !== id) {
                    return ingredient;
                }

                const isAddition =
                    newQuantity > ingredient.quantity_person_ingradient;

                return {
                    ...ingredient,
                    quantity_person_ingradient: newQuantity,
                    ...(isAddition && { purchase_date: todayIso() }),
                };
            }),
        );
    };

    const saveUpdatedQuantities = async () => {
        const changedIngredients = updatedIngredients.filter(
            (updatedIngredient) => {
                const original = personIngredients.find(
                    (ingredient) => ingredient.id === updatedIngredient.id,
                );

                return (
                    original &&
                    original.quantity_person_ingradient !==
                        updatedIngredient.quantity_person_ingradient
                );
            },
        );

        if (changedIngredients.length === 0) {
            setIsEditingQuantity(false);

            return;
        }

        // close the editor regardless of outcome; a failure is toasted globally
        await updateQuantities({ updatedIngredients: changedIngredients });
        setIsEditingQuantity(false);
    };

    return {
        allIngredients,
        personIngredients,
        selectedIngredients,
        toggleIngredientSelection,
        isEditing,
        isEditingQuantity,
        updatedIngredients,
        handleQuantityChange,
        saveUpdatedQuantities,
        handleSaveOrToggleEdit,
        handleCancelEdit,
        handleToggleQuantityEdit,
    };
};
