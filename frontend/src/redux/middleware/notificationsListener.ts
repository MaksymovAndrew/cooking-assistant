import {
    createListenerMiddleware,
    isAnyOf,
    isRejectedWithValue,
} from "@reduxjs/toolkit";
import i18next from "i18next";

import { accountSecurityApi } from "redux/services/accountSecurityApi";
import { authApi } from "redux/services/authApi";
import type { AxiosBaseQueryError } from "redux/services/axiosBaseQuery";
import { caloriesApi } from "redux/services/caloriesApi";
import { addNotification } from "redux/slices/notificationsSlice";

import { registerNotificationActions } from "./notificationActions";
import { registerSuccessToasts } from "./successToasts";
import { registerPantryToasts } from "./successToasts.pantry";

const isQueryError = (payload: unknown): payload is AxiosBaseQueryError => {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    return "data" in payload && typeof payload.data === "string";
};

export const getErrorMessage = (payload: unknown): string =>
    isQueryError(payload)
        ? payload.data
        : i18next.t("notifications.somethingWentWrong");

// these show their own feedback, or (logout) shouldn't surface a scary generic error
export const isSelfHandledRejection = isAnyOf(
    authApi.endpoints.login.matchRejected,
    authApi.endpoints.register.matchRejected,
    authApi.endpoints.getMe.matchRejected,
    authApi.endpoints.logout.matchRejected,
    accountSecurityApi.endpoints.forgotPassword.matchRejected,
    accountSecurityApi.endpoints.resetPassword.matchRejected,
    accountSecurityApi.endpoints.changePassword.matchRejected,
    accountSecurityApi.endpoints.signOutEverywhere.matchRejected,
    authApi.endpoints.updateProfile.matchRejected,
    accountSecurityApi.endpoints.confirmEmail.matchRejected,
    caloriesApi.endpoints.updateCalorieGoal.matchRejected,
);

export const notificationsListener = createListenerMiddleware();

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

registerSuccessToasts(notificationsListener);
registerPantryToasts(notificationsListener);
registerNotificationActions(notificationsListener);
