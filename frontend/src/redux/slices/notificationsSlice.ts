import type { PayloadAction } from "@reduxjs/toolkit";
import { createAction, createSlice, nanoid } from "@reduxjs/toolkit";

export type NotificationType = "success" | "error" | "info";

// a follow-up destination shown under the message, e.g. the list something was just added to
export interface NotificationLink {
    href: string;
    label: string;
}

// a one-press follow-up, kept as plain data so the store stays serialisable; the middleware runs it
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

// what a caller provides; the id is generated in the action `prepare` step
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
            // a repeat replaces the visible copy: several requests failing at once (e.g. the server going down
            // mid-session) still show one toast, and a confirmation repeated while on screen shows again in full
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
