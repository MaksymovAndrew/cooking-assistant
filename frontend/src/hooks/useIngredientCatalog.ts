import { useMemo, useState } from "react";

import type { PantryIngredient, UserIngredient } from "types/userIngredient";

import { useGetIngredientsQuery } from "redux/services/ingredientsApi";
import {
    useGetUserIngredientsQuery,
    useSaveUserIngredientMutation,
    useUpdateQuantitiesMutation,
} from "redux/services/userIngredientsApi";

import { sortIngredientsByName } from "utils/sortIngredientsByName";

const todayIso = () => new Date().toISOString().split("T")[0];

// distinct from any real RTK Query result (including undefined pre-load), so the first render always resyncs regardless of whether the query already resolved before mount
const NOT_SYNCED = Symbol("not-synced");

// pantry view model: data comes from RTK Query (the Pantry tag refetches the list after every write), the editing/selection state stays local UI state
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
                slug: item.ingredient_slug,
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
    const [syncedUserIngredients, setSyncedUserIngredients] = useState<
        UserIngredient[] | undefined | typeof NOT_SYNCED
    >(NOT_SYNCED);

    // every fresh load of the pantry (mount, or a refetch after a write elsewhere) starts the selection at everything already owned - adjusted during render, not via an effect
    if (rawUserIngredients !== syncedUserIngredients) {
        setSyncedUserIngredients(rawUserIngredients);
        setSelectedIngredients(personIngredients.map((item) => item.id));
    }

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
        if (isEditingQuantity) {
            setIsEditingQuantity(false);

            return;
        }

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

    const handleSaveQuantity = async (id: number) => {
        const updated = updatedIngredients.find(
            (ingredient) => ingredient.id === id,
        );
        const original = personIngredients.find(
            (ingredient) => ingredient.id === id,
        );

        if (!updated || !original) {
            return;
        }

        if (
            original.quantity_person_ingradient ===
            updated.quantity_person_ingradient
        ) {
            return;
        }

        // a failed mutation is already toasted by the global listener
        await updateQuantities({ updatedIngredients: [updated] });
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
        handleSaveQuantity,
        handleSaveOrToggleEdit,
        handleCancelEdit,
        handleToggleQuantityEdit,
    };
};
