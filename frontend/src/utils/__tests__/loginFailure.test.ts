import { ERROR_CODES } from "constants/errorCodes";

import { resolveLoginFailure } from "utils/loginFailure";
import type { LockoutState } from "utils/loginLockout";
import { EMPTY_LOCKOUT } from "utils/loginLockout";

const NOW = new Date("2026-01-01T00:00:00.000Z").getTime();
const SECOND_MS = 1000;
const FOUR_FAILURES: LockoutState = {
    failures: 4,
    lockedUntil: null,
    lastFailureAt: NOW,
};

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

describe("resolveLoginFailure", () => {
    it("should count wrong credentials as a failed attempt", () => {
        const failure = resolveLoginFailure(
            { status: 401, data: "Invalid login or password" },
            EMPTY_LOCKOUT,
        );

        expect(failure).toEqual({
            next: { failures: 1, lockedUntil: null, lastFailureAt: NOW },
            errorKey: "errors.invalidCredentials",
        });
    });

    it("should leave the lockout untouched on a server fault", () => {
        expect(
            resolveLoginFailure({ status: 503, data: "down" }, FOUR_FAILURES),
        ).toEqual({ next: null, errorKey: "errors.serverError" });
    });

    it("should lock for the server's Retry-After on a rate limit", () => {
        const failure = resolveLoginFailure(
            { status: 429, data: "slow down", retryAfter: 3600 },
            EMPTY_LOCKOUT,
        );

        expect(failure.errorKey).toBe("errors.tooManyAttempts");
        expect(failure.seconds).toBe(3600);
        expect(failure.next).toEqual({
            failures: 1,
            lockedUntil: NOW + 3600 * SECOND_MS,
            lastFailureAt: NOW,
        });
    });

    it("should recognise a rate limit by its code alone", () => {
        const failure = resolveLoginFailure(
            { code: ERROR_CODES.RATE_LIMITED, retryAfter: 30 },
            EMPTY_LOCKOUT,
        );

        expect(failure.errorKey).toBe("errors.tooManyAttempts");
        expect(failure.seconds).toBe(30);
    });

    it("should keep the client lock when it ends after the server's", () => {
        const failure = resolveLoginFailure(
            { status: 429, data: "slow down", retryAfter: 1 },
            FOUR_FAILURES,
        );

        expect(failure.next?.failures).toBe(5);
        expect(failure.next?.lockedUntil).toBeGreaterThan(NOW + SECOND_MS);
    });
});
