import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
            // the container itself holds focus right after opening, and it is not in the list
            const isOutsideFocusable = !focusable.some(
                (element) => element === document.activeElement,
            );

            if (isOutsideFocusable) {
                e.preventDefault();
                (e.shiftKey ? last : first).focus();
            } else if (e.shiftKey && document.activeElement === first) {
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
