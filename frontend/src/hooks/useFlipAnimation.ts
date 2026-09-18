import type { RefObject } from "react";
import { useLayoutEffect, useRef } from "react";

export const FLIP_ID_ATTRIBUTE = "data-flip-id";

// spread onto an element to put it under the animation: {...flipTarget("item-3")}
export const flipTarget = (id: string) => ({ [FLIP_ID_ATTRIBUTE]: id });

const MOVE_DURATION_MS = 280;
const ENTER_DURATION_MS = 220;
const EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

interface Point {
    x: number;
    y: number;
}

// page coordinates, so a scroll between two renders doesn't read as movement; null for an element
// that isn't laid out (display: none), whose empty box sits at the page origin and would fly in from there
const pagePosition = (element: HTMLElement): Point | null => {
    const rect = element.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
        return null;
    }

    return { x: rect.left + window.scrollX, y: rect.top + window.scrollY };
};

// the global reduced-motion rule only reaches CSS; the Web Animations API has to ask for itself
const prefersReducedMotion = (): boolean =>
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches;

// FLIP: every element marked with data-flip-id inside the container glides from where it was drawn
// last time to where it is now - reorders, moves between lists and the gap a removal leaves. An id
// seen for the first time fades in, unless nothing was on screen before - the list's first load
export const useFlipAnimation = (
    containerRef: RefObject<HTMLElement | null>,
    layoutKey: string,
): void => {
    const positions = useRef<Map<string, Point> | null>(null);

    useLayoutEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const previous = positions.current;
        const next = new Map<string, Point>();
        const hadElements = previous !== null && previous.size > 0;
        const shouldAnimate = hadElements && !prefersReducedMotion();

        container
            .querySelectorAll<HTMLElement>(`[${FLIP_ID_ATTRIBUTE}]`)
            .forEach((element) => {
                const id = element.getAttribute(FLIP_ID_ATTRIBUTE) ?? "";
                const position = pagePosition(element);
                const before = previous?.get(id);

                if (!position) {
                    return;
                }

                next.set(id, position);

                if (!shouldAnimate || typeof element.animate !== "function") {
                    return;
                }

                if (!before) {
                    element.animate(
                        [
                            { opacity: 0, transform: "translateY(-6px)" },
                            { opacity: 1, transform: "none" },
                        ],
                        { duration: ENTER_DURATION_MS, easing: EASING },
                    );

                    return;
                }

                const dx = before.x - position.x;
                const dy = before.y - position.y;

                if (dx !== 0 || dy !== 0) {
                    element.animate(
                        [
                            { transform: `translate(${dx}px, ${dy}px)` },
                            { transform: "none" },
                        ],
                        { duration: MOVE_DURATION_MS, easing: EASING },
                    );
                }
            });

        positions.current = next;
    }, [containerRef, layoutKey]);
};
