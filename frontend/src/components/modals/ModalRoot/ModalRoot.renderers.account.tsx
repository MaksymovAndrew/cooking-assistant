import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import {
    ChangePasswordModal,
    DeleteAccountModal,
    EditProfileModal,
    PantryAddIngredientModal,
} from "./ModalRoot.lazy.account";

export const renderAccountModal = (modal: ActiveModal | null) => {
    if (modal?.type === MODAL_TYPE.addIngredient) {
        return <PantryAddIngredientModal modalId={modal.id} />;
    }

    if (modal?.type === MODAL_TYPE.editProfile) {
        return (
            <EditProfileModal
                modalId={modal.id}
                currentUser={modal.currentUser}
            />
        );
    }

    if (modal?.type === MODAL_TYPE.changePassword) {
        return <ChangePasswordModal modalId={modal.id} />;
    }

    if (modal?.type === MODAL_TYPE.deleteAccount) {
        return <DeleteAccountModal modalId={modal.id} login={modal.login} />;
    }

    return null;
};
