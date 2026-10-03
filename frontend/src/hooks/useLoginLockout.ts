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

export const useLoginLockout = (
    login: string,
    onUnlock?: () => void,
): UseLoginLockoutResult => {
    const isHydrated = useIsHydrated();
    const [lockout, setLockout] = useState<LockoutState>(EMPTY_LOCKOUT);
    const [syncedLogin, setSyncedLogin] = useState<string | null>(null);
    // a slow response for a since-changed login must not clobber the one on screen
    const currentLoginRef = useRef(login);

    useLayoutEffect(() => {
        currentLoginRef.current = login;
    });

    // read during render, so a locked account never flashes unlocked; storage waits for hydration
    if (isHydrated && login !== syncedLogin) {
        setSyncedLogin(login);
        setLockout(readLockout(login));
    }

    const countdown = useLockoutCountdown(lockout, setLockout, onUnlock);

    return { lockout, setLockout, currentLoginRef, ...countdown };
};
