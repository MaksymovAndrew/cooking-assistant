import type { RefObject } from "react";

import { useClickOutside } from "hooks/useClickOutside";
import { useEscapeKey } from "hooks/useEscapeKey";

// focus returns to the trigger on Escape, and on an outside click only if it then landed nowhere
export const usePopoverDismiss = <T extends HTMLElement>(
    ref: RefObject<T | null>,
    isOpen: boolean,
    onDismiss: () => void,
    triggerRef?: RefObject<HTMLElement | null>,
): void => {
    useClickOutside(
        ref,
        () => {
            const hadFocus = ref.current?.contains(document.activeElement);

            onDismiss();

            // after the click's own focus change, which drops it to the page on plain content
            if (hadFocus) {
                setTimeout(() => {
                    if (document.activeElement === document.body) {
                        triggerRef?.current?.focus();
                    }
                });
            }
        },
        isOpen,
    );
    useEscapeKey(() => {
        onDismiss();
        triggerRef?.current?.focus();
    }, isOpen);
};
