import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { useAppDispatch } from "redux/hooks";
import { useDeleteUserIngredientMutation } from "redux/services/userIngredientsApi";
import { closeModal } from "redux/slices/uiSlice";

import { ConfirmModal } from "components/modals/ConfirmModal";

interface DeleteIngredientModalProps {
    modalId: string;
    ingredient: PantryIngredient;
}

export const DeleteIngredientModal = ({
    modalId,
    ingredient,
}: DeleteIngredientModalProps) => {
    const { t } = useTranslation("ingredients");
    const dispatch = useAppDispatch();
    const [deleteIngredient, { isLoading }] = useDeleteUserIngredientMutation();

    const handleConfirm = async () => {
        // success and failure toasts are handled by the global listener
        const result = await deleteIngredient(ingredient.id);

        if ("data" in result) {
            dispatch(closeModal(modalId));
        }
    };

    return (
        <ConfirmModal
            title={t("page.deleteTitle")}
            message={t("page.deleteConfirmMessage", {
                name: ingredient.ingredient_name,
            })}
            confirmLabel={t("page.confirmButton")}
            cancelLabel={t("page.cancelButton")}
            isConfirmDisabled={isLoading}
            onClose={() => dispatch(closeModal(modalId))}
            onConfirm={() => void handleConfirm()}
        />
    );
};
