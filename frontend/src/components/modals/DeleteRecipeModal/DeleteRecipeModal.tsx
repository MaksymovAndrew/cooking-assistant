import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useAppDispatch } from "redux/hooks";
import { useDeleteRecipeMutation } from "redux/services/recipesApi";
import { closeModal } from "redux/slices/uiSlice";

import { ConfirmModal } from "components/modals/ConfirmModal";

interface DeleteRecipeModalProps {
    modalId: string;
    recipeId: string;
}

export const DeleteRecipeModal = ({
    modalId,
    recipeId,
}: DeleteRecipeModalProps) => {
    const { t } = useTranslation("recipes");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [deleteRecipe, { isLoading }] = useDeleteRecipeMutation();

    const handleConfirm = async () => {
        // success and failure toasts are handled by the global listener
        const result = await deleteRecipe(recipeId);

        if ("data" in result) {
            dispatch(closeModal(modalId));
            void navigate(ROUTES.allRecipes);
        }
    };

    return (
        <ConfirmModal
            title={t("recipeDetailsPage.deleteTitle")}
            message={t("recipeDetailsPage.deleteMessage")}
            isConfirmDisabled={isLoading}
            onClose={() => dispatch(closeModal(modalId))}
            onConfirm={() => void handleConfirm()}
        />
    );
};
