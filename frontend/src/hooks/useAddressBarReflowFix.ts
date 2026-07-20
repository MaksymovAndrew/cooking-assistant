import type { RefObject } from "react";
import { useEffect } from "react";

// a longstanding Chrome bug (chromium issue 41395555) leaves a `position: fixed` element's
// painted content stuck at its old layout while the address bar collapses/expands on scroll -
// a plain layout read (getBoundingClientRect) isn't enough to make Chrome repaint the subtree,
// so this briefly removes the element from rendering and restores it to force a full repaint
export const useAddressBarReflowFix = <T extends HTMLElement>(
    ref: RefObject<T | null>,
): void => {
    useEffect(() => {
        const visualViewport = window.visualViewport;

        if (!visualViewport) {
            return undefined;
        }

        const forceRepaint = () => {
            const el = ref.current;

            if (!el) {
                return;
            }

            const previousDisplay = el.style.display;

            el.style.display = "none";
            el.getBoundingClientRect();
            el.style.display = previousDisplay;
        };

        visualViewport.addEventListener("resize", forceRepaint);

        return () => {
            visualViewport.removeEventListener("resize", forceRepaint);
        };
    }, [ref]);
};
