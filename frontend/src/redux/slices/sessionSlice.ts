import { createSlice } from "@reduxjs/toolkit";

import {
    HTTP_STATUS_FORBIDDEN,
    HTTP_STATUS_UNAUTHORIZED,
} from "constants/http";

import { authApi } from "redux/services/authApi";

export type SessionStatus = "checking" | "authed" | "unauthed" | "error";

const AUTH_ERROR_STATUSES = [HTTP_STATUS_UNAUTHORIZED, HTTP_STATUS_FORBIDDEN];

interface SessionState {
    status: SessionStatus;
}

const initialState: SessionState = { status: "checking" };

// "error" is only for failed getMe checks (network/401); unauthed is set explicitly on logout
const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        loggedOut: (state) => {
            state.status = "unauthed";
        },
    },
    extraReducers: (builder) => {
        builder
            // a background refetch (any Me-touching mutation invalidates this) must not flip an
            // already-authed session back to "checking" - PrivateRoute unmounts its Outlet while
            // checking, which would reset every page's local state (e.g. the active profile tab)
            .addMatcher(authApi.endpoints.getMe.matchPending, (state) => {
                if (state.status !== "authed") {
                    state.status = "checking";
                }
            })
            .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state) => {
                state.status = "authed";
            })
            // mirrors the matchPending guard above - a background refetch failing with a
            // transient/network error must not kick an already-authed session to the full-page
            // ErrorState; a genuine 401/403 still goes to "error" (and the api client's own
            // interceptor is already redirecting to /login for that case regardless)
            .addMatcher(
                authApi.endpoints.getMe.matchRejected,
                (state, action) => {
                    const status = action.payload?.status;
                    const isAuthFailure =
                        typeof status === "number" &&
                        AUTH_ERROR_STATUSES.includes(status);

                    if (state.status === "authed" && !isAuthFailure) {
                        return;
                    }

                    state.status = "error";
                },
            )
            .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
                state.status = "unauthed";
            });
    },
});

export const { loggedOut } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
