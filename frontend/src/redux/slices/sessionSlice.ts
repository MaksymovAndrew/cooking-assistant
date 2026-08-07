import { createSlice } from "@reduxjs/toolkit";

import {
    HTTP_STATUS_FORBIDDEN,
    HTTP_STATUS_UNAUTHORIZED,
} from "constants/http";

import { authApi } from "redux/services/authApi";

export type SessionStatus = "checking" | "authed" | "guest" | "error";

const AUTH_ERROR_STATUSES = [HTTP_STATUS_UNAUTHORIZED, HTTP_STATUS_FORBIDDEN];

interface SessionState {
    status: SessionStatus;
}

const initialState: SessionState = { status: "checking" };

// "error" is a genuine failure (network/5xx); getMe returns 200+null for a guest, not 401/403
const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        loggedOut: (state) => {
            state.status = "guest";
        },
    },
    extraReducers: (builder) => {
        builder
            // a background refetch must not flip an already-determined session back to "checking"
            .addMatcher(authApi.endpoints.getMe.matchPending, (state) => {
                if (state.status !== "authed" && state.status !== "guest") {
                    state.status = "checking";
                }
            })
            .addMatcher(
                authApi.endpoints.getMe.matchFulfilled,
                (state, action) => {
                    state.status = action.payload === null ? "guest" : "authed";
                },
            )
            // a transient rejection can't touch a determined session, but an unexpected 401/403 still can
            .addMatcher(
                authApi.endpoints.getMe.matchRejected,
                (state, action) => {
                    const status = action.payload?.status;
                    const isAuthFailure =
                        typeof status === "number" &&
                        AUTH_ERROR_STATUSES.includes(status);
                    const wasDetermined =
                        state.status === "authed" || state.status === "guest";

                    if (wasDetermined && !isAuthFailure) {
                        return;
                    }

                    state.status = isAuthFailure ? "guest" : "error";
                },
            )
            .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
                state.status = "guest";
            });
    },
});

export const { loggedOut } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
