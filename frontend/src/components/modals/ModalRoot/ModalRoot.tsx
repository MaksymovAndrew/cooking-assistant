import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { closeModal, MODAL_TYPE } from "redux/slices/uiSlice";

import { CalorieLimitModal } from "components/modals/CalorieLimitModal";
import { DeleteCalorieIntakeModal } from "components/modals/DeleteCalorieIntakeModal";
import { DeleteIngredientModal } from "components/modals/DeleteIngredientModal";
import { DeleteMenuModal } from "components/modals/DeleteMenuModal";
import { DeleteRecipeModal } from "components/modals/DeleteRecipeModal";
import { ExpiredIngredientsModal } from "components/modals/ExpiredIngredientsModal";
import { LogoutConfirmModal } from "components/modals/LogoutConfirmModal";
import { PurchaseHistoryModal } from "components/modals/PurchaseHistoryModal";
import { ThemeChangeConfirmModal } from "components/modals/ThemeChangeConfirmModal";

// the calorie-feature modals manage their own dispatch/close internally (like DeleteIngredientModal), so they only need the modal itself
const renderCalorieModal = (modal: ActiveModal | null) => {
    if (modal?.type === MODAL_TYPE.deleteCalorieIntake) {
        return (
            <DeleteCalorieIntakeModal
                modalId={modal.id}
                intakeId={modal.intakeId}
                title={modal.title}
            />
        );
    }

    if (modal?.type === MODAL_TYPE.calorieLimit) {
        return (
            <CalorieLimitModal
                modalId={modal.id}
                consumed={modal.consumed}
                goal={modal.goal}
            />
        );
    }

    return null;
};

export const ModalRoot = () => {
    const modal = useAppSelector(selectActiveModal);
    const dispatch = useAppDispatch();

    const handleClose = () => {
        if (modal) {
            dispatch(closeModal(modal.id));
        }
    };

    if (modal?.type === MODAL_TYPE.ingredientHistory) {
        return (
            <PurchaseHistoryModal
                ingredientId={modal.ingredientId}
                ingredientName={modal.ingredientName}
                onClose={handleClose}
            />
        );
    }

    if (modal?.type === MODAL_TYPE.deleteRecipe) {
        return (
            <DeleteRecipeModal
                modalId={modal.id}
                recipeId={modal.recipeId}
                recipeTitle={modal.recipeTitle}
            />
        );
    }

    if (modal?.type === MODAL_TYPE.deleteMenu) {
        return (
            <DeleteMenuModal
                modalId={modal.id}
                menuId={modal.menuId}
                menuTitle={modal.menuTitle}
            />
        );
    }

    if (modal?.type === MODAL_TYPE.deleteIngredient) {
        return (
            <DeleteIngredientModal
                modalId={modal.id}
                ingredient={modal.ingredient}
            />
        );
    }

    if (modal?.type === MODAL_TYPE.logout) {
        return <LogoutConfirmModal modalId={modal.id} />;
    }

    if (modal?.type === MODAL_TYPE.themeChange) {
        return (
            <ThemeChangeConfirmModal
                modalId={modal.id}
                nextMode={modal.nextMode}
            />
        );
    }

    if (modal?.type === MODAL_TYPE.expiredIngredients) {
        return (
            <ExpiredIngredientsModal
                modalId={modal.id}
                ingredients={modal.ingredients}
            />
        );
    }

    return renderCalorieModal(modal);
};
