import { createSlice } from "@reduxjs/toolkit";

import { authApi } from "redux/services/authApi";

export type SessionStatus = "checking" | "authed" | "unauthed" | "error";

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
            .addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
                state.status = "error";
            })
            .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
                state.status = "unauthed";
            });
    },
});

export const { loggedOut } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
