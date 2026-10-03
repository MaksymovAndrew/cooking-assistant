import { act, renderHook } from "@testing-library/react";
import { useState } from "react";

import { useLockoutCountdown } from "hooks/useLockoutCountdown";

import type { LockoutState } from "utils/loginLockout";
import { EMPTY_LOCKOUT, LOCKOUT_LADDER_MINUTES } from "utils/loginLockout";

const NOW = new Date("2026-01-01T00:00:00.000Z").getTime();
const SECOND_MS = 1000;
const FIRST_LOCK_MS = LOCKOUT_LADDER_MINUTES[0] * 60 * SECOND_MS;
const LOCKED: LockoutState = {
    failures: 5,
    lockedUntil: NOW + FIRST_LOCK_MS,
    lastFailureAt: NOW,
};

const onUnlock = jest.fn();

const renderCountdown = (initial: LockoutState) =>
    renderHook(() => {
        const [lockout, setLockout] = useState(initial);

        return {
            lockout,
            ...useLockoutCountdown(lockout, setLockout, onUnlock),
        };
    });

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

describe("useLockoutCountdown", () => {
    it("should report nothing while unlocked", () => {
        const { result } = renderCountdown(EMPTY_LOCKOUT);

        expect(result.current.isLocked).toBe(false);
        expect(result.current.lockoutRemainingMs).toBeNull();
        expect(result.current.lockoutTotalMs).toBeNull();
    });

    it("should report the remaining and total time of an active lock", () => {
        const { result } = renderCountdown(LOCKED);

        expect(result.current.isLocked).toBe(true);
        expect(result.current.lockoutRemainingMs).toBe(FIRST_LOCK_MS);
        expect(result.current.lockoutTotalMs).toBe(FIRST_LOCK_MS);
    });

    it("should count down once a second", () => {
        const { result } = renderCountdown(LOCKED);

        act(() => {
            jest.advanceTimersByTime(3 * SECOND_MS);
        });

        expect(result.current.lockoutRemainingMs).toBe(
            FIRST_LOCK_MS - 3 * SECOND_MS,
        );
    });

    it("should lift the lock and call onUnlock the moment it expires", () => {
        const { result } = renderCountdown(LOCKED);

        act(() => {
            jest.advanceTimersByTime(FIRST_LOCK_MS);
        });

        expect(result.current.isLocked).toBe(false);
        expect(result.current.lockout.lockedUntil).toBeNull();
        expect(result.current.lockout.failures).toBe(5);
        expect(onUnlock).toHaveBeenCalledTimes(1);
    });

    it("should lift a lock that already expired straight away", () => {
        const { result } = renderCountdown({
            ...LOCKED,
            lockedUntil: NOW - SECOND_MS,
        });

        expect(result.current.isLocked).toBe(false);
        expect(result.current.lockout.lockedUntil).toBeNull();
        expect(onUnlock).toHaveBeenCalledTimes(1);
    });
});
