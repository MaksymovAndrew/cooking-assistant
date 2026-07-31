import type { RefObject } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { MS_PER_MINUTE } from "constants/time";

import {
    ATTEMPTS_PER_LOCK,
    LOCKOUT_LADDER_MINUTES,
    type LockoutState,
    readLockout,
} from "utils/loginLockout";

const TICK_INTERVAL_MS = 1000;

export interface UseLoginLockoutResult {
    lockout: LockoutState;
    setLockout: (next: LockoutState) => void;
    currentLoginRef: RefObject<string>;
    isLocked: boolean;
    lockoutRemainingMs: number | null;
    lockoutTotalMs: number | null;
}

// tracks the escalating client-side lockout for the identifier currently on screen: reads/re-reads per-account state from localStorage, ticks a live countdown, and auto-unlocks the moment the lock expires
export const useLoginLockout = (
    login: string,
    onUnlock?: () => void,
): UseLoginLockoutResult => {
    const [lockout, setLockout] = useState(() => readLockout(login));
    const [syncedLogin, setSyncedLogin] = useState(login);
    const [now, setNow] = useState(() => Date.now());

    const { lockedUntil } = lockout;
    // tracks the identifier actually on screen so a slow response for a since-changed login doesn't clobber it
    const currentLoginRef = useRef(login);
    // read through a ref so a fresh onUnlock each render doesn't re-subscribe the tick interval below
    const onUnlockRef = useRef(onUnlock);

    useLayoutEffect(() => {
        currentLoginRef.current = login;
        onUnlockRef.current = onUnlock;
    });

    // lockout is scoped per identifier, so switching which account is typed re-reads that account's own state - adjusted during render (not via an effect) so a locked account never flashes as unlocked for a frame
    if (login !== syncedLogin) {
        setSyncedLogin(login);
        setLockout(readLockout(login));
    }

    // ticks once a second while locked, both to drive a live countdown and to auto-unlock the moment the lock expires
    useEffect(() => {
        if (lockedUntil === null) {
            return undefined;
        }

        const tick = () => {
            const currentNow = Date.now();

            setNow(currentNow);

            if (currentNow >= lockedUntil) {
                setLockout((prev) => ({ ...prev, lockedUntil: null }));
                onUnlockRef.current?.();
            }
        };

        tick();
        const interval = setInterval(tick, TICK_INTERVAL_MS);

        return () => {
            clearInterval(interval);
        };
    }, [lockedUntil]);

    const isLocked = lockedUntil !== null && now < lockedUntil;
    const lockoutRemainingMs = isLocked ? lockedUntil - now : null;
    // derived from the same ladder registerFailure climbs, purely for the countdown progress bar
    const lockoutTotalMs =
        isLocked && lockout.failures >= ATTEMPTS_PER_LOCK
            ? LOCKOUT_LADDER_MINUTES[
                  Math.min(
                      Math.floor(lockout.failures / ATTEMPTS_PER_LOCK) - 1,
                      LOCKOUT_LADDER_MINUTES.length - 1,
                  )
              ] * MS_PER_MINUTE
            : null;

    return {
        lockout,
        setLockout,
        currentLoginRef,
        isLocked,
        lockoutRemainingMs,
        lockoutTotalMs,
    };
};
