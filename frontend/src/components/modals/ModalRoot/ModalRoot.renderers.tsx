import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import {
    CalorieLimitModal,
    DeleteCalorieIntakeModal,
    DeleteIngredientModal,
    ExpiredIngredientsModal,
    LogIntakeModal,
    NewsModal,
    OfflineModal,
    PurchaseHistoryModal,
    RestockIngredientModal,
} from "./ModalRoot.lazy";
import { renderCookingModal } from "./ModalRoot.renderers.cooking";

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

    if (modal?.type === MODAL_TYPE.logIntake) {
        return (
            <LogIntakeModal
                modalId={modal.id}
                recipeId={modal.recipeId}
                menuId={modal.menuId}
                title={modal.title}
                caloriesPerPortion={modal.caloriesPerPortion}
                initialPortions={modal.initialPortions}
            />
        );
    }

    return renderCookingModal(modal);
};

const renderAppModal = (modal: ActiveModal | null) => {
    if (modal?.type === MODAL_TYPE.news) {
        return <NewsModal modalId={modal.id} />;
    }

    if (modal?.type === MODAL_TYPE.offline) {
        return <OfflineModal modalId={modal.id} />;
    }

    return renderCalorieModal(modal);
};

export const renderIngredientModal = (
    modal: ActiveModal | null,
    onCloseHistory: () => void,
) => {
    if (modal?.type === MODAL_TYPE.ingredientHistory) {
        return (
            <PurchaseHistoryModal
                ingredientId={modal.ingredientId}
                ingredientName={modal.ingredientName}
                onClose={onCloseHistory}
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

    if (modal?.type === MODAL_TYPE.restockIngredient) {
        return (
            <RestockIngredientModal
                modalId={modal.id}
                ingredient={modal.ingredient}
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

    return renderAppModal(modal);
};
