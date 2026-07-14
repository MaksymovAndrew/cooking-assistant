import type { LockoutState } from "utils/loginLockout";
import {
    clearLockout,
    formatCountdown,
    LOCKOUT_LADDER_MINUTES,
    mergeServerRetryAfter,
    readLockout,
    registerFailure,
    writeLockout,
} from "utils/loginLockout";

const NOW = new Date("2026-01-01T00:00:00.000Z").getTime();
const MINUTE_MS = 60_000;
const EMPTY: LockoutState = {
    failures: 0,
    lockedUntil: null,
    lastFailureAt: null,
};

const registerFailures = (count: number) => {
    let state = EMPTY;

    for (let i = 0; i < count; i += 1) {
        state = registerFailure(state);
    }

    return state;
};

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

describe("registerFailure", () => {
    it("should not lock before the 5th failure", () => {
        const state = registerFailures(4);

        expect(state.lockedUntil).toBeNull();
        expect(state.failures).toBe(4);
    });

    it("should lock for the first ladder step on the 5th failure", () => {
        const state = registerFailures(5);

        expect(state.lockedUntil).toBe(
            NOW + LOCKOUT_LADDER_MINUTES[0] * MINUTE_MS,
        );
    });

    it.each([
        [5, 0],
        [10, 1],
        [15, 1],
        [20, 1],
        [25, 1],
    ])(
        "should escalate to ladder step %i minutes after %i failures",
        (failureCount, stageIndex) => {
            const state = registerFailures(failureCount);

            expect(state.lockedUntil).toBe(
                NOW + LOCKOUT_LADDER_MINUTES[stageIndex] * MINUTE_MS,
            );
        },
    );

    it("should hold the last ladder step beyond the top of the ladder", () => {
        const state = registerFailures(30);

        const lastStep =
            LOCKOUT_LADDER_MINUTES[LOCKOUT_LADDER_MINUTES.length - 1];

        expect(state.lockedUntil).toBe(NOW + lastStep * MINUTE_MS);
    });

    it("should reset the streak when the previous failure is older than the idle window", () => {
        const staleState: LockoutState = {
            failures: 8,
            lockedUntil: null,
            lastFailureAt: NOW - 31 * MINUTE_MS,
        };

        const state = registerFailure(staleState);

        expect(state.failures).toBe(1);
        expect(state.lockedUntil).toBeNull();
    });

    it("should keep accumulating when the previous failure is within the idle window", () => {
        const recentState: LockoutState = {
            failures: 8,
            lockedUntil: null,
            lastFailureAt: NOW - 29 * MINUTE_MS,
        };

        const state = registerFailure(recentState);

        expect(state.failures).toBe(9);
    });
});

describe("mergeServerRetryAfter", () => {
    it("should adopt the server cool-down when it is later than the client lockout", () => {
        const state = mergeServerRetryAfter(EMPTY, 30);

        expect(state.lockedUntil).toBe(NOW + 30_000);
    });

    it("should keep the client lockout when it is later than the server cool-down", () => {
        const state = mergeServerRetryAfter(
            {
                failures: 5,
                lockedUntil: NOW + 5 * MINUTE_MS,
                lastFailureAt: NOW,
            },
            30,
        );

        expect(state.lockedUntil).toBe(NOW + 5 * MINUTE_MS);
    });
});

describe("localStorage persistence", () => {
    it("should round-trip a written lockout state", () => {
        const state = registerFailures(5);

        writeLockout(state, "alice");

        expect(readLockout("alice")).toEqual(state);
    });

    it("should return an empty state when nothing was written", () => {
        expect(readLockout("alice")).toEqual(EMPTY);
    });

    it("should return an empty state when the stored value is corrupt", () => {
        localStorage.setItem("cooking.loginLockout.alice", "{not json");

        expect(readLockout("alice")).toEqual(EMPTY);
    });

    it("should clear the stored state", () => {
        writeLockout(registerFailures(5), "alice");

        clearLockout("alice");

        expect(readLockout("alice")).toEqual(EMPTY);
    });

    it("should scope the lockout per login, so one account's lockout doesn't affect another's", () => {
        writeLockout(registerFailures(5), "alice");

        expect(readLockout("alice").lockedUntil).not.toBeNull();
        expect(readLockout("bob")).toEqual(EMPTY);
    });

    it("should trim surrounding whitespace from the login", () => {
        writeLockout(registerFailures(5), "alice");

        expect(readLockout(" alice ").lockedUntil).not.toBeNull();
    });

    it("should keep case-distinct logins separate, since login lookups are case-sensitive server-side", () => {
        writeLockout(registerFailures(5), "Alice");

        expect(readLockout("Alice").lockedUntil).not.toBeNull();
        expect(readLockout("alice")).toEqual(EMPTY);
    });
});

describe("formatCountdown", () => {
    it("should format a sub-minute duration as 0:ss", () => {
        expect(formatCountdown(5_000)).toBe("0:05");
    });

    it("should format a multi-minute duration as m:ss", () => {
        expect(formatCountdown(2 * MINUTE_MS + 9_000)).toBe("2:09");
    });

    it("should never go below 0:00", () => {
        expect(formatCountdown(-5_000)).toBe("0:00");
    });
});
