import type { PayloadAction } from "@reduxjs/toolkit";
import { createAction, createSlice, nanoid } from "@reduxjs/toolkit";

export type NotificationType = "success" | "error" | "info";

export interface NotificationLink {
    href: string;
    label: string;
}

// plain data so the store stays serialisable; the middleware runs it
export interface NotificationAction {
    kind: "undoCooking";
    consumptionId: number;
    label: string;
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    link: NotificationLink | null;
    action: NotificationAction | null;
}

export interface NotificationInput {
    type: NotificationType;
    message: string;
    link?: NotificationLink | null;
    action?: NotificationAction | null;
}

interface NotificationsState {
    items: Notification[];
}

const initialState: NotificationsState = { items: [] };

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        addNotification: {
            // a repeat replaces the visible copy, so many requests failing at once still show one toast
            reducer: (state, action: PayloadAction<Notification>) => {
                state.items = state.items.filter(
                    (item) =>
                        item.type !== action.payload.type ||
                        item.message !== action.payload.message,
                );
                state.items.push(action.payload);
            },
            prepare: ({
                link = null,
                action = null,
                ...input
            }: NotificationInput) => ({
                payload: { id: nanoid(), ...input, link, action },
            }),
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload,
            );
        },
    },
});

export const runNotificationAction = createAction<NotificationAction>(
    "notifications/runAction",
);

export const { addNotification, removeNotification } =
    notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
