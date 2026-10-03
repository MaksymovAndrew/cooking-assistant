import type { RefObject } from "react";
import { useEffect } from "react";

export const useFocusOnOpen = (
    targetRef: RefObject<HTMLElement | null>,
    isOpen: boolean,
): void => {
    useEffect(() => {
        if (isOpen) {
            targetRef.current?.focus();
        }
    }, [targetRef, isOpen]);
};
