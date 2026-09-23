import type { RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";

import { useIsHydrated } from "hooks/useIsHydrated";
import { useLockoutCountdown } from "hooks/useLockoutCountdown";

import {
    EMPTY_LOCKOUT,
    type LockoutState,
    readLockout,
} from "utils/loginLockout";

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
    const isHydrated = useIsHydrated();
    const [lockout, setLockout] = useState<LockoutState>(EMPTY_LOCKOUT);
    const [syncedLogin, setSyncedLogin] = useState<string | null>(null);
    // tracks the identifier actually on screen so a slow response for a since-changed login doesn't clobber it
    const currentLoginRef = useRef(login);

    useLayoutEffect(() => {
        currentLoginRef.current = login;
    });

    // lockout is scoped per identifier, so switching which account is typed re-reads that account's own state - adjusted during render (not via an effect) so a locked account never flashes as unlocked for a frame. Gated on hydration because the stored state is a browser-only fact: reading it any earlier would make the server and the first client render disagree
    if (isHydrated && login !== syncedLogin) {
        setSyncedLogin(login);
        setLockout(readLockout(login));
    }

    const countdown = useLockoutCountdown(lockout, setLockout, onUnlock);

    return { lockout, setLockout, currentLoginRef, ...countdown };
};
