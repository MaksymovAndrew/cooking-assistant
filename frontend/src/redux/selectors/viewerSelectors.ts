import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "redux/store";

import { selectIsAuthed } from "./sessionSelectors";

export const selectIsGuest = (state: RootState) =>
    state.session.status === "guest";

export interface ViewerCapabilities {
    canCreate: boolean;
    canFavourite: boolean;
    canEditOwn: boolean;
    canUsePantry: boolean;
}

// components ask "can I?", not "am I logged in?" - every capability maps to isAuthed today, but
// this is the one place a future partial-permission tier changes instead of every call site
export const selectViewerCapabilities = createSelector(
    selectIsAuthed,
    (isAuthed): ViewerCapabilities => ({
        canCreate: isAuthed,
        canFavourite: isAuthed,
        canEditOwn: isAuthed,
        canUsePantry: isAuthed,
    }),
);
