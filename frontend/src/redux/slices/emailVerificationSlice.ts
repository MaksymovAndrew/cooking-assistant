import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface EmailVerificationState {
    resendCooldownUntil: number | null;
}

const initialState: EmailVerificationState = { resendCooldownUntil: null };

// shared across every page (Home banner, Settings) so resending on one no longer resets the cooldown shown on the other
const emailVerificationSlice = createSlice({
    name: "emailVerification",
    initialState,
    reducers: {
        resendCooldownStarted: (state, action: PayloadAction<number>) => {
            state.resendCooldownUntil = action.payload;
        },
        resendCooldownExpired: (state) => {
            state.resendCooldownUntil = null;
        },
    },
});

export const { resendCooldownStarted, resendCooldownExpired } =
    emailVerificationSlice.actions;
export const emailVerificationReducer = emailVerificationSlice.reducer;
