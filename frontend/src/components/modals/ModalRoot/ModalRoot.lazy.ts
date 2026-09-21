import { lazy } from "react";

// ModalRoot sits in the root layout, so a static import would put all fourteen modals -
// and every API service they use - in the bundle every visitor downloads
export const OfflineModal = lazy(() =>
    import("components/connectivity/OfflineModal").then((m) => ({
        default: m.OfflineModal,
    })),
);

export const CalorieLimitModal = lazy(() =>
    import("components/modals/CalorieLimitModal").then((m) => ({
        default: m.CalorieLimitModal,
    })),
);

export const DeleteCalorieIntakeModal = lazy(() =>
    import("components/modals/DeleteCalorieIntakeModal").then((m) => ({
        default: m.DeleteCalorieIntakeModal,
    })),
);

export const DeleteIngredientModal = lazy(() =>
    import("components/modals/DeleteIngredientModal").then((m) => ({
        default: m.DeleteIngredientModal,
    })),
);

export const DeleteMenuModal = lazy(() =>
    import("components/modals/DeleteMenuModal").then((m) => ({
        default: m.DeleteMenuModal,
    })),
);

export const DeleteRecipeModal = lazy(() =>
    import("components/modals/DeleteRecipeModal").then((m) => ({
        default: m.DeleteRecipeModal,
    })),
);

export const DeleteTagModal = lazy(() =>
    import("components/modals/DeleteTagModal").then((m) => ({
        default: m.DeleteTagModal,
    })),
);

export const ExpiredIngredientsModal = lazy(() =>
    import("components/modals/ExpiredIngredientsModal").then((m) => ({
        default: m.ExpiredIngredientsModal,
    })),
);

export const LogIntakeModal = lazy(() =>
    import("components/modals/LogIntakeModal").then((m) => ({
        default: m.LogIntakeModal,
    })),
);

export const LogoutConfirmModal = lazy(() =>
    import("components/modals/LogoutConfirmModal").then((m) => ({
        default: m.LogoutConfirmModal,
    })),
);

export const NewsModal = lazy(() =>
    import("components/modals/NewsModal").then((m) => ({
        default: m.NewsModal,
    })),
);

export const PurchaseHistoryModal = lazy(() =>
    import("components/modals/PurchaseHistoryModal").then((m) => ({
        default: m.PurchaseHistoryModal,
    })),
);

export const RestockIngredientModal = lazy(() =>
    import("components/modals/RestockIngredientModal").then((m) => ({
        default: m.RestockIngredientModal,
    })),
);

export const ThemeChangeConfirmModal = lazy(() =>
    import("components/modals/ThemeChangeConfirmModal").then((m) => ({
        default: m.ThemeChangeConfirmModal,
    })),
);
