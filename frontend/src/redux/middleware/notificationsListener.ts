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

import { registerSuccessToasts } from "./successToasts";

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

// excluded from the global toast - these already show their own feedback (inline form errors, PrivateRoute's session message) or shouldn't surface a scary generic error (logout)
export const isSelfHandledRejection = isAnyOf(
    authApi.endpoints.login.matchRejected,
    authApi.endpoints.register.matchRejected,
    authApi.endpoints.getMe.matchRejected,
    authApi.endpoints.logout.matchRejected,
    accountSecurityApi.endpoints.forgotPassword.matchRejected,
    accountSecurityApi.endpoints.resetPassword.matchRejected,
    accountSecurityApi.endpoints.changePassword.matchRejected,
    authApi.endpoints.updateProfile.matchRejected,
    // confirmEmail's page renders its own rich success/failure state - a toast would be redundant
    accountSecurityApi.endpoints.confirmEmail.matchRejected,
    // useCalorieGoalForm already renders its own inline error, same as updateProfile above
    caloriesApi.endpoints.updateCalorieGoal.matchRejected,
);

export const notificationsListener = createListenerMiddleware();

// single global error channel: every failed request becomes an error toast, except the auth forms above that already show their own inline error
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
