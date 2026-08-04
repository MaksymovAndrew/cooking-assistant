import React, { useCallback, useEffect, useRef, useState } from "react";

import styles from "./HorizontalScrollbar.module.scss";

interface HorizontalScrollbarProps {
    scrollRef: React.RefObject<HTMLElement | null>;
}

interface ThumbMetrics {
    widthPercent: number;
    offsetPercent: number;
}

const PERCENT_MULTIPLIER = 100;

const computeThumb = (el: HTMLElement): ThumbMetrics | null => {
    const { scrollWidth, clientWidth, scrollLeft } = el;

    if (scrollWidth <= clientWidth) {
        return null;
    }

    const widthPercent = (clientWidth / scrollWidth) * PERCENT_MULTIPLIER;
    const maxScrollLeft = scrollWidth - clientWidth;
    const offsetPercent =
        maxScrollLeft > 0
            ? (scrollLeft / maxScrollLeft) * (PERCENT_MULTIPLIER - widthPercent)
            : 0;

    return { widthPercent, offsetPercent };
};

// a custom track+thumb for any horizontally-scrollable element - the native
// scrollbar is invisible on touch and only shows on desktop hover, so this
// gives every device the same "there's more content" affordance and lets a
// mouse/touch drag on the track scroll directly. Renders nothing once the
// content already fits (tracks size via ResizeObserver, so callers never
// need to tell it when their content changes)
export const HorizontalScrollbar: React.FC<HorizontalScrollbarProps> = ({
    scrollRef,
}) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [thumb, setThumb] = useState<ThumbMetrics | null>(null);

    useEffect(() => {
        const el = scrollRef.current;

        if (!el) {
            return undefined;
        }

        const update = () => {
            setThumb(computeThumb(el));
        };

        update();
        el.addEventListener("scroll", update);

        // jsdom (tests) has no ResizeObserver - same guard pattern as
        // useMediaQuery's window.matchMedia check
        const resizeObserver =
            typeof ResizeObserver === "function"
                ? new ResizeObserver(update)
                : null;

        resizeObserver?.observe(el);

        return () => {
            el.removeEventListener("scroll", update);
            resizeObserver?.disconnect();
        };
    }, [scrollRef]);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            const scrollEl = scrollRef.current;
            const track = trackRef.current;

            if (!scrollEl || !track) {
                return;
            }

            // not implemented in jsdom (tests) or some older browsers - the
            // document-level move/up listeners below still work without it
            if (typeof e.currentTarget.setPointerCapture === "function") {
                e.currentTarget.setPointerCapture(e.pointerId);
            }

            const trackRect = track.getBoundingClientRect();
            const maxScrollLeft = scrollEl.scrollWidth - scrollEl.clientWidth;

            const scrollToPointer = (clientX: number) => {
                const ratio = (clientX - trackRect.left) / trackRect.width;

                scrollEl.scrollLeft = Math.max(
                    0,
                    Math.min(maxScrollLeft, ratio * scrollEl.scrollWidth),
                );
            };

            scrollToPointer(e.clientX);

            const handleMove = (moveEvent: PointerEvent) => {
                scrollToPointer(moveEvent.clientX);
            };
            const handleUp = () => {
                document.removeEventListener("pointermove", handleMove);
                document.removeEventListener("pointerup", handleUp);
            };

            document.addEventListener("pointermove", handleMove);
            document.addEventListener("pointerup", handleUp);
        },
        [scrollRef],
    );

    if (!thumb) {
        return null;
    }

    return (
        <div
            ref={trackRef}
            data-testid="horizontal-scrollbar-track"
            className={styles["horizontal-scrollbar__track"]}
            onPointerDown={handlePointerDown}
        >
            <div
                data-testid="horizontal-scrollbar-thumb"
                className={styles["horizontal-scrollbar__thumb"]}
                style={{
                    width: `${thumb.widthPercent}%`,
                    left: `${thumb.offsetPercent}%`,
                }}
            />
        </div>
    );
};
