import React, { useCallback, useEffect, useRef, useState } from "react";

import styles from "./HorizontalScrollbar.module.scss";
import { computeThumb, type ThumbMetrics } from "./thumbMetrics";

interface HorizontalScrollbarProps {
    scrollRef: React.RefObject<HTMLElement | null>;
}

// the native scrollbar is invisible on touch screens, so every device gets this draggable one
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

        // jsdom has no ResizeObserver
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

            // missing in jsdom and some older browsers; the document listeners below work without it
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
