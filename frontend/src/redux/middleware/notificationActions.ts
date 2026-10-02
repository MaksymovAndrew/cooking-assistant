import type {
    ListenerMiddlewareInstance,
    ThunkDispatch,
    UnknownAction,
} from "@reduxjs/toolkit";

import { pantryConsumptionApi } from "redux/services/pantryConsumptionApi";
import type { NotificationAction } from "redux/slices/notificationsSlice";
import { runNotificationAction } from "redux/slices/notificationsSlice";

type ActionRunner = (
    action: NotificationAction,
    dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
) => void;

// a new kind of toast action without a runner here is a compile error, not a dead button
const RUNNERS: Record<NotificationAction["kind"], ActionRunner> = {
    undoCooking: ({ consumptionId }, dispatch) => {
        void dispatch(
            pantryConsumptionApi.endpoints.undoCooking.initiate(consumptionId),
        );
    },
};

// a toast only names its follow-up; the request behind it is made here, outside any component
export const registerNotificationActions = (
    listener: ListenerMiddlewareInstance,
) => {
    listener.startListening({
        actionCreator: runNotificationAction,
        effect: ({ payload }, listenerApi) => {
            RUNNERS[payload.kind](payload, listenerApi.dispatch);
        },
    });
};
