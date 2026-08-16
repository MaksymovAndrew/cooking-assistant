import { ListFilter, X } from "lucide-react";
import type { ReactNode } from "react";
import React, { useLayoutEffect, useRef, useState } from "react";

import { MOBILE_MEDIA_QUERY } from "constants/breakpoints";

import { useMediaQuery } from "hooks/useMediaQuery";
import { usePopoverDismiss } from "hooks/usePopoverDismiss";
import { useScrollLock } from "hooks/useScrollLock";

import styles from "./FilterPanel.module.scss";

export interface FilterPanelProps {
    title: string;
    closeLabel: string;
    resetLabel: string;
    applyAriaLabel: string;
    applyMobileLabel: string;
    applyDesktopLabel: string;
    activeCount: number;
    onReset: () => void;
    children: ReactNode;
}

const FILTER_ICON_SIZE = 17;
const CLOSE_ICON_SIZE = 14;

// mirrors the SCSS `&__popover`'s tablet+ `top: calc(100% + 8px)`
const POPOVER_TOP_GAP_PX = 8;
// breathing room before the viewport's bottom edge, matches --s-4
const POPOVER_BOTTOM_MARGIN_PX = 16;
const POPOVER_MIN_HEIGHT_PX = 160;

// trigger + badge + popover chrome shared by every filter panel (recipes, menus, ...);
// the popover body is page-specific and passed in as children
export const FilterPanel: React.FC<FilterPanelProps> = ({
    title,
    closeLabel,
    resetLabel,
    applyAriaLabel,
    applyMobileLabel,
    applyDesktopLabel,
    activeCount,
    onReset,
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

    const closePopover = () => {
        setIsOpen(false);
    };

    usePopoverDismiss(containerRef, isOpen, closePopover);
    useScrollLock(isOpen);

    // the tablet+ popover is anchored below the trigger (not the true viewport bottom) and
    // opens with the page scroll locked, so a flat 85vh max-height can push its footer past
    // the fold with no way to reach it - clamp against the space actually left below the trigger
    useLayoutEffect(() => {
        if (!isOpen || isMobile) return undefined;

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
    }, [isOpen, isMobile]);

    return (
        <div ref={containerRef} className={styles["filter-panel"]}>
            <button
                type="button"
                onClick={() => {
                    setIsOpen((prev) => !prev);
                }}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                className={[
                    styles["filter-panel__trigger"],
                    activeCount > 0 && styles["filter-panel__trigger--active"],
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <ListFilter size={FILTER_ICON_SIZE} aria-hidden="true" />
                {title}
                {activeCount > 0 && (
                    <span className={styles["filter-panel__badge"]}>
                        {activeCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div
                    ref={popoverRef}
                    role="dialog"
                    aria-label={title}
                    className={styles["filter-panel__popover"]}
                >
                    <div className={styles["filter-panel__header"]}>
                        <span>{title}</span>
                        <button
                            type="button"
                            aria-label={closeLabel}
                            onClick={closePopover}
                            className={styles["filter-panel__close"]}
                        >
                            <X size={CLOSE_ICON_SIZE} aria-hidden="true" />
                        </button>
                    </div>

                    {children}

                    <div className={styles["filter-panel__footer"]}>
                        <button
                            type="button"
                            onClick={onReset}
                            className={styles["filter-panel__reset-button"]}
                        >
                            {resetLabel}
                        </button>
                        <button
                            type="button"
                            onClick={closePopover}
                            aria-label={applyAriaLabel}
                            className={styles["filter-panel__apply-button"]}
                        >
                            <span
                                aria-hidden="true"
                                className={styles["filter-panel__apply-mobile"]}
                            >
                                {applyMobileLabel}
                            </span>
                            <span
                                aria-hidden="true"
                                className={
                                    styles["filter-panel__apply-desktop"]
                                }
                            >
                                {applyDesktopLabel}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
