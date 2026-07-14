import type { RootState } from "redux/store";

export const selectResendCooldownUntil = (state: RootState) =>
    state.emailVerification.resendCooldownUntil;
