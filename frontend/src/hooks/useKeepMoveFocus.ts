import { useEffect, useRef } from "react";

import type { MoveDirection } from "types/reorder";

// a row moved down is re-inserted, dropping focus; it goes back, or to the other button at the end
export const useKeepMoveFocus = () => {
    const upRef = useRef<HTMLButtonElement>(null);
    const downRef = useRef<HTMLButtonElement>(null);
    const pressed = useRef<MoveDirection | null>(null);

    useEffect(() => {
        const direction = pressed.current;

        pressed.current = null;

        const active = document.activeElement;
        // a disabled button can still hold focus in some browsers; anywhere else the user moved on
        const isFocusOnMover =
            active === document.body ||
            active === upRef.current ||
            active === downRef.current;

        if (direction === null || !isFocusOnMover) {
            return;
        }

        const [same, other] =
            direction === -1 ? [upRef, downRef] : [downRef, upRef];
        const target = same.current?.disabled ? other : same;

        target.current?.focus();
    });

    const remember = (direction: MoveDirection) => {
        pressed.current = direction;
    };

    return { upRef, downRef, remember };
};
