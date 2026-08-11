import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// traps Tab navigation inside the container so it can't escape to the page behind it
export const useFocusTrap = (
    containerRef: React.RefObject<HTMLElement | null>,
): void => {
    useEffect(() => {
        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== "Tab") {
                return;
            }

            const container = containerRef.current;
            const focusable = container
                ? Array.from(
                      container.querySelectorAll<HTMLElement>(
                          FOCUSABLE_SELECTOR,
                      ),
                  )
                : [];

            if (focusable.length === 0) {
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleTabKey);

        return () => {
            document.removeEventListener("keydown", handleTabKey);
        };
    }, [containerRef]);
};
