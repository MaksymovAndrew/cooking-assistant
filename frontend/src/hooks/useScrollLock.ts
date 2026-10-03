import { useEffect } from "react";

// module-level, so overlapping locks compose: the first saves the state, the last restores it
let lockCount = 0;
let lockedScrollY = 0;
let previousStyle = { position: "", top: "", width: "", overflow: "" };

// overflow: hidden alone doesn't lock scroll on iOS Safari; pinning the body at its offset does
export const useScrollLock = (locked: boolean): void => {
    useEffect(() => {
        if (!locked) {
            return undefined;
        }

        const { body } = document;

        if (lockCount === 0) {
            lockedScrollY = window.scrollY;
            previousStyle = {
                position: body.style.position,
                top: body.style.top,
                width: body.style.width,
                overflow: body.style.overflow,
            };
            body.style.position = "fixed";
            body.style.top = `-${lockedScrollY}px`;
            body.style.width = "100%";
            body.style.overflow = "hidden";
        }
        lockCount += 1;

        return () => {
            lockCount -= 1;
            if (lockCount === 0) {
                body.style.position = previousStyle.position;
                body.style.top = previousStyle.top;
                body.style.width = previousStyle.width;
                body.style.overflow = previousStyle.overflow;
                window.scrollTo(0, lockedScrollY);
            }
        };
    }, [locked]);
};
