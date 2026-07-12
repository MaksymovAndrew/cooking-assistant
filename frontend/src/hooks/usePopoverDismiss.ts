import type { RefObject } from "react";

import { useClickOutside } from "hooks/useClickOutside";
import { useEscapeKey } from "hooks/useEscapeKey";

// the click-outside + Escape dismiss pairing shared by every open/close popover (account menu, recipe/menu filter panels)
export const usePopoverDismiss = <T extends HTMLElement>(
    ref: RefObject<T | null>,
    isOpen: boolean,
    onDismiss: () => void,
): void => {
    useClickOutside(ref, onDismiss, isOpen);
    useEscapeKey(onDismiss, isOpen);
};
