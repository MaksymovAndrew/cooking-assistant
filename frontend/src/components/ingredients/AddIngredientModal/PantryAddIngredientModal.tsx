import React from "react";

import { useAppDispatch } from "redux/hooks";
import { closeModal } from "redux/slices/uiSlice";

import { useAddPantryIngredients } from "hooks/useAddPantryIngredients";
import { useIngredientCatalog } from "hooks/useIngredientCatalog";

import { ignoreRejection } from "utils/ignoreRejection";

import { AddIngredientModal } from "./AddIngredientModal";

interface PantryAddIngredientModalProps {
    modalId: string;
}

export const PantryAddIngredientModal: React.FC<
    PantryAddIngredientModalProps
> = ({ modalId }) => {
    const dispatch = useAppDispatch();
    const catalog = useIngredientCatalog();
    const handleClose = () => dispatch(closeModal(modalId));
    const adding = useAddPantryIngredients(catalog.allIngredients, handleClose);

    return (
        <AddIngredientModal
            allIngredients={catalog.allIngredients}
            personIngredients={catalog.personIngredients}
            selectedIngredients={adding.selectedIngredients}
            onToggle={adding.toggleIngredientSelection}
            onConfirm={(quantities) => {
                adding.confirm(quantities).catch(ignoreRejection);
            }}
            onClose={handleClose}
        />
    );
};
