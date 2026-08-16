import type { PayloadAction } from "@reduxjs/toolkit";
import {
    createListenerMiddleware,
    isAnyOf,
    isRejectedWithValue,
} from "@reduxjs/toolkit";
import i18next from "i18next";

import { authApi } from "redux/services/authApi";
import type { AxiosBaseQueryError } from "redux/services/axiosBaseQuery";
import { caloriesApi } from "redux/services/caloriesApi";
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

// excluded from the global toast - these already show their own feedback (inline form errors, PrivateRoute's session message) or shouldn't surface a scary generic error (logout)
export const isSelfHandledRejection = isAnyOf(
    authApi.endpoints.login.matchRejected,
    authApi.endpoints.register.matchRejected,
    authApi.endpoints.getMe.matchRejected,
    authApi.endpoints.logout.matchRejected,
    authApi.endpoints.forgotPassword.matchRejected,
    authApi.endpoints.resetPassword.matchRejected,
    authApi.endpoints.changePassword.matchRejected,
    authApi.endpoints.updateProfile.matchRejected,
    // confirmEmail's page renders its own rich success/failure state - a toast would be redundant
    authApi.endpoints.confirmEmail.matchRejected,
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

// only mutations that keep the user on the same page get a success toast - navigating away is the signal
const registerSuccessToast = <Payload>(
    matcher: (action: unknown) => action is PayloadAction<Payload>,
    messageKey: string,
) => {
    notificationsListener.startListening({
        matcher,
        effect: (_action, listenerApi) => {
            listenerApi.dispatch(
                addNotification({
                    type: "success",
                    message: i18next.t(messageKey),
                }),
            );
        },
    });
};

registerSuccessToast(
    recipesApi.endpoints.deleteRecipe.matchFulfilled,
    "notifications.recipeDeleted",
);
registerSuccessToast(
    menusApi.endpoints.deleteMenu.matchFulfilled,
    "notifications.menuDeleted",
);
registerSuccessToast(
    userIngredientsApi.endpoints.deleteUserIngredient.matchFulfilled,
    "notifications.ingredientDeleted",
);
registerSuccessToast(
    caloriesApi.endpoints.deleteCalorieIntake.matchFulfilled,
    "notifications.calorieIntakeDeleted",
);
registerSuccessToast(
    caloriesApi.endpoints.logCalorieIntake.matchFulfilled,
    "notifications.intakeLogged",
);
registerSuccessToast(
    userIngredientsApi.endpoints.saveUserIngredient.matchFulfilled,
    "notifications.ingredientsSaved",
);
registerSuccessToast(
    userIngredientsApi.endpoints.updatePurchase.matchFulfilled,
    "notifications.purchaseSaved",
);
registerSuccessToast(
    authApi.endpoints.changePassword.matchFulfilled,
    "notifications.passwordChanged",
);
registerSuccessToast(
    authApi.endpoints.updateProfile.matchFulfilled,
    "notifications.profileUpdated",
);
registerSuccessToast(
    authApi.endpoints.deleteAccount.matchFulfilled,
    "notifications.accountDeleted",
);
registerSuccessToast(
    authApi.endpoints.requestEmailVerification.matchFulfilled,
    "notifications.verificationEmailSent",
);
// a deliberate logout gets its own confirmation - distinct from the silent hard-redirect that happens when a session merely expires
registerSuccessToast(
    authApi.endpoints.logout.matchFulfilled,
    "notifications.loggedOut",
);
