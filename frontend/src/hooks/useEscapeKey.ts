import { useEffect, useRef } from "react";

export const useEscapeKey = (onEscape: () => void, enabled = true): void => {
    // read through a ref so a fresh onEscape each render doesn't re-subscribe
    const onEscapeRef = useRef(onEscape);

    onEscapeRef.current = onEscape;

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onEscapeRef.current();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [enabled]);
};
