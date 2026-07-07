import type { RefObject } from "react";
import { useEffect } from "react";

export const useClickOutside = <T extends HTMLElement>(
    ref: RefObject<T | null>,
    handler: () => void,
    enabled = true,
): void => {
    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const handleMouseDown = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler();
            }
        };

        document.addEventListener("mousedown", handleMouseDown);

        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
        };
    }, [ref, handler, enabled]);
};
