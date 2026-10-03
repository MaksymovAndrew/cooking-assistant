import type { CurrentUser } from "types/auth";

import type { MODAL_TYPE } from "./uiSlice.modals";

export interface EditProfileModalInput {
    type: typeof MODAL_TYPE.editProfile;
    currentUser: CurrentUser;
}

export interface ChangePasswordModalInput {
    type: typeof MODAL_TYPE.changePassword;
}

export interface DeleteAccountModalInput {
    type: typeof MODAL_TYPE.deleteAccount;
    login: string;
}

export type AccountModalInput =
    EditProfileModalInput | ChangePasswordModalInput | DeleteAccountModalInput;
