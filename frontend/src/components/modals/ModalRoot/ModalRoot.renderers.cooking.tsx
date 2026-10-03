import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { CookedItModal } from "./ModalRoot.lazy";
import { renderAccountModal } from "./ModalRoot.renderers.account";

export const renderCookingModal = (modal: ActiveModal | null) => {
    if (modal?.type === MODAL_TYPE.cookedIt) {
        return (
            <CookedItModal
                modalId={modal.id}
                recipeId={modal.recipeId}
                menuId={modal.menuId}
                title={modal.title}
                requirements={modal.requirements}
                caloriesPerPortion={modal.caloriesPerPortion}
                initialPortions={modal.initialPortions}
            />
        );
    }

    return renderAccountModal(modal);
};
