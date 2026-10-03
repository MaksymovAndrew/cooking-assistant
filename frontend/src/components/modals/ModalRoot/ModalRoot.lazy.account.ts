import { lazy } from "react";

// lazy like ModalRoot.lazy.ts - ModalRoot is in every visitor's bundle
export const PantryAddIngredientModal = lazy(() =>
    import("components/ingredients/AddIngredientModal").then((m) => ({
        default: m.PantryAddIngredientModal,
    })),
);

export const EditProfileModal = lazy(() =>
    import("components/profile/EditProfileModal").then((m) => ({
        default: m.EditProfileModal,
    })),
);

export const ChangePasswordModal = lazy(() =>
    import("components/settings/ChangePasswordModal").then((m) => ({
        default: m.ChangePasswordModal,
    })),
);

export const DeleteAccountModal = lazy(() =>
    import("components/settings/DeleteAccountModal").then((m) => ({
        default: m.DeleteAccountModal,
    })),
);
