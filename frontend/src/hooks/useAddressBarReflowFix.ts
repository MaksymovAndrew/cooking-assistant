import type { RefObject } from "react";
import { useEffect } from "react";

// chromium 41395555: fixed content keeps stale paint as the address bar moves; a layout read can't fix it
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
