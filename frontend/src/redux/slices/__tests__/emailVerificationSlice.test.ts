import {
    emailVerificationReducer,
    resendCooldownExpired,
    resendCooldownStarted,
} from "redux/slices/emailVerificationSlice";

describe("emailVerificationSlice", () => {
    it("should start with no cooldown active", () => {
        const state = emailVerificationReducer(undefined, { type: "@@INIT" });

        expect(state.resendCooldownUntil).toBeNull();
    });

    it("should set resendCooldownUntil on resendCooldownStarted", () => {
        const state = emailVerificationReducer(
            { resendCooldownUntil: null },
            resendCooldownStarted(12345),
        );

        expect(state.resendCooldownUntil).toBe(12345);
    });

    it("should clear resendCooldownUntil on resendCooldownExpired", () => {
        const state = emailVerificationReducer(
            { resendCooldownUntil: 12345 },
            resendCooldownExpired(),
        );

        expect(state.resendCooldownUntil).toBeNull();
    });
});
