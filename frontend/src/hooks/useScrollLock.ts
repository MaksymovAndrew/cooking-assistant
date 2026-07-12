import { useEffect } from "react";

// module-level so overlapping locks compose: only the first captures the prior overflow, only the last restores it
let lockCount = 0;
let previousOverflow = "";

export const useScrollLock = (locked: boolean): void => {
    useEffect(() => {
        if (!locked) {
            return undefined;
        }

        if (lockCount === 0) {
            previousOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
        }
        lockCount += 1;

        return () => {
            lockCount -= 1;
            if (lockCount === 0) {
                document.body.style.overflow = previousOverflow;
            }
        };
    }, [locked]);
};
