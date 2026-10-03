import { act, renderHook } from "@testing-library/react";

import { useLoginLockout } from "hooks/useLoginLockout";

import type { LockoutState } from "utils/loginLockout";
import { writeLockout } from "utils/loginLockout";

const NOW = new Date("2026-01-01T00:00:00.000Z").getTime();
const MINUTE_MS = 60_000;
const LOCKED: LockoutState = {
    failures: 5,
    lockedUntil: NOW + MINUTE_MS,
    lastFailureAt: NOW,
};

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

describe("useLoginLockout", () => {
    it("should pick up the stored lock of the account being typed", () => {
        writeLockout(LOCKED, "chef");

        const { result } = renderHook(() => useLoginLockout("chef"));

        expect(result.current.lockout).toEqual(LOCKED);
        expect(result.current.isLocked).toBe(true);
    });

    it("should re-read the lock when another account is typed", () => {
        writeLockout(LOCKED, "chef");

        const { result, rerender } = renderHook(
            ({ login }: { login: string }) => useLoginLockout(login),
            { initialProps: { login: "chef" } },
        );

        rerender({ login: "baker" });

        expect(result.current.isLocked).toBe(false);
        expect(result.current.currentLoginRef.current).toBe("baker");
    });

    it("should unlock and call onUnlock once the lock runs out", () => {
        const onUnlock = jest.fn();

        writeLockout(LOCKED, "chef");

        const { result } = renderHook(() => useLoginLockout("chef", onUnlock));

        act(() => {
            jest.advanceTimersByTime(MINUTE_MS);
        });

        expect(result.current.isLocked).toBe(false);
        expect(onUnlock).toHaveBeenCalledTimes(1);
    });

    it("should lock as soon as a new lock is set", () => {
        const { result } = renderHook(() => useLoginLockout("chef"));

        act(() => {
            result.current.setLockout(LOCKED);
        });

        expect(result.current.isLocked).toBe(true);
        expect(result.current.lockoutRemainingMs).toBe(MINUTE_MS);
    });
});
