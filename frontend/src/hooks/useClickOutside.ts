import type { RefObject } from "react";
import { useEffect, useRef } from "react";

export const useClickOutside = <T extends HTMLElement>(
    ref: RefObject<T | null>,
    handler: () => void,
    enabled = true,
): void => {
    // read through a ref so a fresh handler each render doesn't re-subscribe
    const handlerRef = useRef(handler);

    handlerRef.current = handler;

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const handleMouseDown = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handlerRef.current();
            }
        };

        document.addEventListener("mousedown", handleMouseDown);

        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
        };
    }, [ref, enabled]);
};
