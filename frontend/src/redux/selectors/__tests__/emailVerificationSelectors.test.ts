import { selectResendCooldownUntil } from "redux/selectors/emailVerificationSelectors";
import type { RootState } from "redux/store";

import { makeTestStore } from "test/store";

const makeState = (resendCooldownUntil: number | null): RootState =>
    makeTestStore({ emailVerification: { resendCooldownUntil } }).getState();

describe("emailVerificationSelectors", () => {
    describe("selectResendCooldownUntil", () => {
        it("should return the cooldown timestamp when set", () => {
            expect(selectResendCooldownUntil(makeState(12345))).toBe(12345);
        });

        it("should return null when there is no active cooldown", () => {
            expect(selectResendCooldownUntil(makeState(null))).toBeNull();
        });
    });
});
