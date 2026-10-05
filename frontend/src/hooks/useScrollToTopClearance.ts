import type { RefObject } from "react";
import { useEffect, useState } from "react";

import { needsScrollToTopClearance } from "utils/scrollToTopClearance";

// the page is measured without the room itself, so making it never decides whether it is needed
export const useScrollToTopClearance = (
    clearanceRef: RefObject<HTMLElement | null>,
): boolean => {
    const [isNeeded, setIsNeeded] = useState(false);

    useEffect(() => {
        const measure = () => {
            const clearance = clearanceRef.current?.offsetHeight ?? 0;
            const pageHeight =
                document.documentElement.scrollHeight - clearance;

            setIsNeeded(
                needsScrollToTopClearance(pageHeight, window.innerHeight),
            );
        };

        measure();
        window.addEventListener("resize", measure);

        // jsdom has no ResizeObserver
        const resizeObserver =
            typeof ResizeObserver === "function"
                ? new ResizeObserver(measure)
                : null;

        resizeObserver?.observe(document.body);

        return () => {
            window.removeEventListener("resize", measure);
            resizeObserver?.disconnect();
        };
    }, [clearanceRef]);

    return isNeeded;
};
