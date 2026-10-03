import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface EmailVerificationState {
    resendCooldownUntil: number | null;
}

const initialState: EmailVerificationState = { resendCooldownUntil: null };

// global so the Home banner and Settings share one resend cooldown
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
