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

// "error" is only for a genuine failure (network/offline) checking the session; a 401/403 on
// getMe means "no session", which is "guest", not an error - guests browse public routes fine
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
            // a background refetch (any Me-touching mutation invalidates this) must not flip an
            // already-determined session back to "checking" - PrivateRoute unmounts its Outlet
            // while checking (resetting every page's local state), and query-skip selectors like
            // selectIsGuest key personal-data fetches off this exact status, so a guest browsing
            // a public page must not have those fetches transiently un-skip mid-visit
            .addMatcher(authApi.endpoints.getMe.matchPending, (state) => {
                if (state.status !== "authed" && state.status !== "guest") {
                    state.status = "checking";
                }
            })
            .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state) => {
                state.status = "authed";
            })
            // mirrors the matchPending guard above - a background refetch failing with a
            // transient/network error must not kick an already-determined session to "error";
            // a genuine 401/403 lands on "guest" (and the api client's own interceptor still
            // redirects to /login for that case on a private route, regardless of this slice)
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
