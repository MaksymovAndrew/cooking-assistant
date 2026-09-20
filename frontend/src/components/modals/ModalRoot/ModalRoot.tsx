import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectActiveModal } from "redux/selectors/uiSelectors";
import { closeModal, MODAL_TYPE } from "redux/slices/uiSlice";

import { DeleteMenuModal } from "components/modals/DeleteMenuModal";
import { DeleteRecipeModal } from "components/modals/DeleteRecipeModal";
import { DeleteTagModal } from "components/modals/DeleteTagModal";
import { LogoutConfirmModal } from "components/modals/LogoutConfirmModal";
import { ThemeChangeConfirmModal } from "components/modals/ThemeChangeConfirmModal";

import { renderIngredientModal } from "./ModalRoot.renderers";

export const ModalRoot = () => {
    const modal = useAppSelector(selectActiveModal);
    const dispatch = useAppDispatch();

    const handleClose = () => {
        if (modal) {
            dispatch(closeModal(modal.id));
        }
    };

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

    return renderIngredientModal(modal, handleClose);
};
