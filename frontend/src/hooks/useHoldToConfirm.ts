import { useCallback, useRef, useState } from "react";

// press-and-hold gesture: onComplete fires only after a full uninterrupted hold; releasing early cancels with no effect
export const useHoldToConfirm = (
    durationMs: number,
    onComplete: () => void,
) => {
    const [isHolding, setIsHolding] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    const clearTimer = useCallback(() => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const start = useCallback(() => {
        clearTimer();
        setIsHolding(true);
        timeoutRef.current = window.setTimeout(() => {
            setIsHolding(false);
            onComplete();
        }, durationMs);
    }, [clearTimer, durationMs, onComplete]);

    const cancel = useCallback(() => {
        setIsHolding(false);
        clearTimer();
    }, [clearTimer]);

    return { isHolding, start, cancel };
};
