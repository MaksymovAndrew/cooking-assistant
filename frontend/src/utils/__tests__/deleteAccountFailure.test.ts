import { ERROR_CODES } from "constants/errorCodes";

import { resolveDeleteAccountFailure } from "utils/deleteAccountFailure";
import { EMPTY_LOCKOUT } from "utils/loginLockout";

describe("resolveDeleteAccountFailure", () => {
    it("should count a rate limit as an attempt and carry its wait", () => {
        const failure = resolveDeleteAccountFailure(
            { status: 429, data: "slow down", retryAfter: 30 },
            EMPTY_LOCKOUT,
        );

        expect(failure.errorKey).toBe(
            "deleteAccountModal.errors.tooManyAttempts",
        );
        expect(failure.next?.failures).toBe(1);
    });

    it("should count a wrong password as an attempt", () => {
        const failure = resolveDeleteAccountFailure(
            {
                status: 401,
                data: "wrong",
                code: ERROR_CODES.CURRENT_PASSWORD_INCORRECT,
            },
            EMPTY_LOCKOUT,
        );

        expect(failure.errorKey).toBe(
            "deleteAccountModal.errors.incorrectPassword",
        );
        expect(failure.next?.failures).toBe(1);
    });

    it("should leave the ladder alone for a server fault", () => {
        expect(
            resolveDeleteAccountFailure(
                { status: 500, data: "boom" },
                EMPTY_LOCKOUT,
            ),
        ).toEqual({
            next: null,
            errorKey: "deleteAccountModal.errors.genericError",
        });
    });
});
