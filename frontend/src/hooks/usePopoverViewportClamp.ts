"use client";

import type { RefObject } from "react";
import { useLayoutEffect } from "react";

// mirrors the SCSS `&__popover`'s tablet+ `top: calc(100% + 8px)`
const POPOVER_TOP_GAP_PX = 8;
// breathing room before the viewport's bottom edge, matches --s-4
const POPOVER_BOTTOM_MARGIN_PX = 16;
const POPOVER_MIN_HEIGHT_PX = 160;

// a popover anchored below its trigger (not the true viewport bottom) and opened with the page
// scroll locked can push its footer past the fold with no way to reach it under a flat max-height -
// clamp against the space actually left below the trigger
export const usePopoverViewportClamp = (
    containerRef: RefObject<HTMLElement | null>,
    popoverRef: RefObject<HTMLElement | null>,
    isActive: boolean,
): void => {
    useLayoutEffect(() => {
        if (!isActive) return undefined;

        const clampToViewport = () => {
            const container = containerRef.current;
            const popover = popoverRef.current;

            if (!container || !popover) return;

            const available =
                window.innerHeight -
                container.getBoundingClientRect().bottom -
                POPOVER_TOP_GAP_PX -
                POPOVER_BOTTOM_MARGIN_PX;

            popover.style.maxHeight = `${Math.max(POPOVER_MIN_HEIGHT_PX, available)}px`;
        };

        clampToViewport();
        window.addEventListener("resize", clampToViewport);

        return () => {
            window.removeEventListener("resize", clampToViewport);
        };
    }, [containerRef, isActive, popoverRef]);
};
