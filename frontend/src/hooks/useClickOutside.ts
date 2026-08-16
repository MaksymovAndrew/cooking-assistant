import type { RefObject } from "react";
import { useEffect, useLayoutEffect, useRef } from "react";

// a control outside the popover container (e.g. a modal footer button) can opt out of being
// treated as an "outside" click by carrying this attribute - otherwise a mousedown-triggered
// close mid-click can shift the layout under a still-in-flight mouseup/click
export const CLICK_OUTSIDE_SAFE_ATTR = "data-click-outside-safe";

export const useClickOutside = <T extends HTMLElement>(
    ref: RefObject<T | null>,
    handler: () => void,
    enabled = true,
): void => {
    // read through a ref so a fresh handler each render doesn't re-subscribe
    const handlerRef = useRef(handler);

    useLayoutEffect(() => {
        handlerRef.current = handler;
    });

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const handleMouseDown = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const isOutsideClick =
                ref.current &&
                !ref.current.contains(target) &&
                !target.closest(`[${CLICK_OUTSIDE_SAFE_ATTR}]`);

            if (isOutsideClick) {
                handlerRef.current();
            }
        };

        document.addEventListener("mousedown", handleMouseDown);

        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
        };
    }, [ref, enabled]);
};
