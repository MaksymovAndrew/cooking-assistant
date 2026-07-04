import {
    createListenerMiddleware,
    isAnyOf,
    isRejectedWithValue,
} from "@reduxjs/toolkit";
import i18next from "i18next";

import { authApi } from "redux/services/authApi";
import type { AxiosBaseQueryError } from "redux/services/axiosBaseQuery";
import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";
import { userIngredientsApi } from "redux/services/userIngredientsApi";
import { addNotification } from "redux/slices/notificationsSlice";

const isQueryError = (payload: unknown): payload is AxiosBaseQueryError => {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    return "data" in payload && typeof payload.data === "string";
};

// pull the user-facing message out of a rejected RTK Query action payload
export const getErrorMessage = (payload: unknown): string =>
    isQueryError(payload)
        ? payload.data
        : i18next.t("notifications.somethingWentWrong");

// excluded from the global toast - these already show their own feedback (inline form errors,
// PrivateRoute's session message) or shouldn't surface a scary generic error (logout)
export const isSelfHandledRejection = isAnyOf(
    authApi.endpoints.login.matchRejected,
    authApi.endpoints.register.matchRejected,
    authApi.endpoints.getMe.matchRejected,
    authApi.endpoints.logout.matchRejected,
);

export const notificationsListener = createListenerMiddleware();

// single global error channel: every failed request becomes an error toast,
// except the auth forms above that already show their own inline error
notificationsListener.startListening({
    matcher: isRejectedWithValue,
    effect: (action, listenerApi) => {
        if (isSelfHandledRejection(action)) {
            return;
        }

        listenerApi.dispatch(
            addNotification({
                type: "error",
                message: getErrorMessage(action.payload),
            }),
        );
    },
});

// only mutations that keep the user on the same page get a success toast - navigating away is the signal
notificationsListener.startListening({
    matcher: recipesApi.endpoints.deleteRecipe.matchFulfilled,
    effect: (_action, listenerApi) => {
        listenerApi.dispatch(
            addNotification({
                type: "success",
                message: i18next.t("notifications.recipeDeleted"),
            }),
        );
    },
});

notificationsListener.startListening({
    matcher: menusApi.endpoints.deleteMenu.matchFulfilled,
    effect: (_action, listenerApi) => {
        listenerApi.dispatch(
            addNotification({
                type: "success",
                message: i18next.t("notifications.menuDeleted"),
            }),
        );
    },
});

notificationsListener.startListening({
    matcher: userIngredientsApi.endpoints.deleteUserIngredient.matchFulfilled,
    effect: (_action, listenerApi) => {
        listenerApi.dispatch(
            addNotification({
                type: "success",
                message: i18next.t("notifications.ingredientDeleted"),
            }),
        );
    },
});

notificationsListener.startListening({
    matcher: userIngredientsApi.endpoints.saveUserIngredient.matchFulfilled,
    effect: (_action, listenerApi) => {
        listenerApi.dispatch(
            addNotification({
                type: "success",
                message: i18next.t("notifications.ingredientsSaved"),
            }),
        );
    },
});

notificationsListener.startListening({
    matcher: userIngredientsApi.endpoints.updateQuantities.matchFulfilled,
    effect: (_action, listenerApi) => {
        listenerApi.dispatch(
            addNotification({
                type: "success",
                message: i18next.t("notifications.quantitiesUpdated"),
            }),
        );
    },
});

notificationsListener.startListening({
    matcher: userIngredientsApi.endpoints.updatePurchase.matchFulfilled,
    effect: (_action, listenerApi) => {
        listenerApi.dispatch(
            addNotification({
                type: "success",
                message: i18next.t("notifications.purchaseSaved"),
            }),
        );
    },
});

// a deliberate logout gets its own confirmation - distinct from the silent
// hard-redirect that happens when a session merely expires
notificationsListener.startListening({
    matcher: authApi.endpoints.logout.matchFulfilled,
    effect: (_action, listenerApi) => {
        listenerApi.dispatch(
            addNotification({
                type: "success",
                message: i18next.t("notifications.loggedOut"),
            }),
        );
    },
});
