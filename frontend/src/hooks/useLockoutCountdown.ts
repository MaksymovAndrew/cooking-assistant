import type { Dispatch, SetStateAction } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { lockoutDurationMs, type LockoutState } from "utils/loginLockout";

const TICK_INTERVAL_MS = 1000;

export const useLockoutCountdown = (
    lockout: LockoutState,
    setLockout: Dispatch<SetStateAction<LockoutState>>,
    onUnlock?: () => void,
) => {
    const [now, setNow] = useState(() => Date.now());
    const { lockedUntil } = lockout;
    // read through a ref so a fresh onUnlock each render doesn't re-subscribe the interval
    const onUnlockRef = useRef(onUnlock);

    useLayoutEffect(() => {
        onUnlockRef.current = onUnlock;
    });

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
    }, [lockedUntil, setLockout]);

    const isLocked = lockedUntil !== null && now < lockedUntil;

    return {
        isLocked,
        lockoutRemainingMs: isLocked ? lockedUntil - now : null,
        lockoutTotalMs: isLocked ? lockoutDurationMs(lockout) : null,
    };
};
