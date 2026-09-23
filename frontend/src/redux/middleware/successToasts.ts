import type {
    ListenerMiddlewareInstance,
    PayloadAction,
} from "@reduxjs/toolkit";
import i18next from "i18next";

import { accountSecurityApi } from "redux/services/accountSecurityApi";
import { authApi } from "redux/services/authApi";
import { caloriesApi } from "redux/services/caloriesApi";
import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";
import { userIngredientsApi } from "redux/services/userIngredientsApi";
import { addNotification } from "redux/slices/notificationsSlice";

// only mutations that keep the user on the same page get a success toast - navigating away is the signal
const registerSuccessToast = <Payload>(
    listener: ListenerMiddlewareInstance,
    matcher: (action: unknown) => action is PayloadAction<Payload>,
    messageKey: string,
) => {
    listener.startListening({
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

export const registerSuccessToasts = (listener: ListenerMiddlewareInstance) => {
    registerSuccessToast(
        listener,
        recipesApi.endpoints.deleteRecipe.matchFulfilled,
        "notifications.recipeDeleted",
    );
    registerSuccessToast(
        listener,
        menusApi.endpoints.deleteMenu.matchFulfilled,
        "notifications.menuDeleted",
    );
    registerSuccessToast(
        listener,
        userIngredientsApi.endpoints.deleteUserIngredient.matchFulfilled,
        "notifications.ingredientDeleted",
    );
    registerSuccessToast(
        listener,
        caloriesApi.endpoints.deleteCalorieIntake.matchFulfilled,
        "notifications.calorieIntakeDeleted",
    );
    registerSuccessToast(
        listener,
        caloriesApi.endpoints.logCalorieIntake.matchFulfilled,
        "notifications.intakeLogged",
    );
    registerSuccessToast(
        listener,
        userIngredientsApi.endpoints.saveUserIngredient.matchFulfilled,
        "notifications.ingredientsSaved",
    );
    registerSuccessToast(
        listener,
        userIngredientsApi.endpoints.updatePurchase.matchFulfilled,
        "notifications.purchaseSaved",
    );
    registerSuccessToast(
        listener,
        accountSecurityApi.endpoints.changePassword.matchFulfilled,
        "notifications.passwordChanged",
    );
    registerSuccessToast(
        listener,
        authApi.endpoints.updateProfile.matchFulfilled,
        "notifications.profileUpdated",
    );
    registerSuccessToast(
        listener,
        authApi.endpoints.deleteAccount.matchFulfilled,
        "notifications.accountDeleted",
    );
    registerSuccessToast(
        listener,
        accountSecurityApi.endpoints.requestEmailVerification.matchFulfilled,
        "notifications.verificationEmailSent",
    );
    // a deliberate logout gets its own confirmation - distinct from the silent hard-redirect that happens when a session merely expires
    registerSuccessToast(
        listener,
        authApi.endpoints.logout.matchFulfilled,
        "notifications.loggedOut",
    );
};
