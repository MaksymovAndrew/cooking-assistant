import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { OfflineModal } from "components/connectivity/OfflineModal";
import { CalorieLimitModal } from "components/modals/CalorieLimitModal";
import { DeleteCalorieIntakeModal } from "components/modals/DeleteCalorieIntakeModal";
import { DeleteIngredientModal } from "components/modals/DeleteIngredientModal";
import { ExpiredIngredientsModal } from "components/modals/ExpiredIngredientsModal";
import { LogIntakeModal } from "components/modals/LogIntakeModal";
import { NewsModal } from "components/modals/NewsModal";
import { PurchaseHistoryModal } from "components/modals/PurchaseHistoryModal";
import { RestockIngredientModal } from "components/modals/RestockIngredientModal";

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

    return null;
};

// app-level modals with no payload of their own - both are enqueued rather than rendered
// in place, so they queue behind whatever is showing instead of stacking on top of it
const renderAppModal = (modal: ActiveModal | null) => {
    if (modal?.type === MODAL_TYPE.news) {
        return <NewsModal modalId={modal.id} />;
    }

    if (modal?.type === MODAL_TYPE.offline) {
        return <OfflineModal modalId={modal.id} />;
    }

    return renderCalorieModal(modal);
};

// the pantry-page modals (history/restock/delete/expired-notice); the chain continues into the
// app-level and calorie modals above, so ModalRoot itself only branches on the record modals
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
