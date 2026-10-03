import type { ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import i18next from "i18next";

import { pantryConsumptionApi } from "redux/services/pantryConsumptionApi";
import { addNotification } from "redux/slices/notificationsSlice";
import { markServerDataStale } from "redux/slices/serverDataSlice";

// both directions mark server-rendered pantry state stale: those pages have no cache to refetch
export const registerPantryToasts = (listener: ListenerMiddlewareInstance) => {
    listener.startListening({
        matcher: pantryConsumptionApi.endpoints.cookRecord.matchFulfilled,
        effect: ({ payload }, listenerApi) => {
            const used = payload.deducted.length;

            listenerApi.dispatch(markServerDataStale());
            listenerApi.dispatch(
                addNotification({
                    type: "success",
                    message:
                        used === 0
                            ? i18next.t("notifications.cookedNothing")
                            : i18next.t("notifications.cooked", {
                                  count: used,
                              }),
                    action: {
                        kind: "undoCooking",
                        consumptionId: payload.consumptionId,
                        label: i18next.t("notifications.undo"),
                    },
                }),
            );
        },
    });
    listener.startListening({
        matcher: pantryConsumptionApi.endpoints.undoCooking.matchFulfilled,
        effect: (_action, listenerApi) => {
            listenerApi.dispatch(markServerDataStale());
            listenerApi.dispatch(
                addNotification({
                    type: "success",
                    message: i18next.t("notifications.cookingUndone"),
                }),
            );
        },
    });
};
