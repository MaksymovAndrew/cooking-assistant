import { Suspense } from "react";

import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { closeModal, MODAL_TYPE } from "redux/slices/uiSlice";

import {
    DeleteMenuModal,
    DeleteRecipeModal,
    DeleteTagModal,
    LogoutConfirmModal,
    ThemeChangeConfirmModal,
} from "./ModalRoot.lazy";
import { renderIngredientModal } from "./ModalRoot.renderers";

const renderRecordModal = (
    modal: ActiveModal | null,
    onCloseHistory: () => void,
) => {
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

    if (modal?.type === MODAL_TYPE.deleteTag) {
        return (
            <DeleteTagModal
                modalId={modal.id}
                tagId={modal.tagId}
                tagName={modal.tagName}
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

    return renderIngredientModal(modal, onCloseHistory);
};

export const ModalRoot = () => {
    const modal = useAppSelector(selectActiveModal);
    const dispatch = useAppDispatch();

    const handleClose = () => {
        if (modal) {
            dispatch(closeModal(modal.id));
        }
    };

    // no fallback: a modal is an overlay opened by a deliberate action, and flashing a
    // placeholder over the page while its chunk arrives reads as a glitch
    return (
        <Suspense fallback={null}>
            {renderRecordModal(modal, handleClose)}
        </Suspense>
    );
};
