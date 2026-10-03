import type { ReactNode } from "react";
import React, { useRef, useState } from "react";

import { MOBILE_MEDIA_QUERY } from "constants/breakpoints";

import { useFocusOnOpen } from "hooks/useFocusOnOpen";
import { useMediaQuery } from "hooks/useMediaQuery";
import { usePopoverDismiss } from "hooks/usePopoverDismiss";
import { usePopoverViewportClamp } from "hooks/usePopoverViewportClamp";
import { useScrollLock } from "hooks/useScrollLock";

import styles from "./FilterPanel.module.scss";
import { FilterPanelFooter } from "./FilterPanelFooter";
import { FilterPanelHeader } from "./FilterPanelHeader";
import { FilterPanelTrigger } from "./FilterPanelTrigger";

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
    const triggerRef = useRef<HTMLButtonElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

    const closePopover = () => {
        setIsOpen(false);
    };

    // the close and apply buttons leave with the popover, taking focus with them
    const closeToTrigger = () => {
        closePopover();
        triggerRef.current?.focus();
    };

    usePopoverDismiss(containerRef, isOpen, closePopover, triggerRef);
    useScrollLock(isOpen);
    useFocusOnOpen(closeRef, isOpen);

    usePopoverViewportClamp(containerRef, popoverRef, isOpen && !isMobile);

    return (
        <>
            {isOpen && (
                <div
                    role="presentation"
                    className={styles["filter-panel__backdrop"]}
                />
            )}
            <div ref={containerRef} className={styles["filter-panel"]}>
                <FilterPanelTrigger
                    title={title}
                    activeCount={activeCount}
                    isOpen={isOpen}
                    onToggle={() => {
                        setIsOpen((prev) => !prev);
                    }}
                    triggerRef={triggerRef}
                />
                {isOpen && (
                    <div
                        ref={popoverRef}
                        role="dialog"
                        aria-label={title}
                        className={styles["filter-panel__popover"]}
                    >
                        <FilterPanelHeader
                            title={title}
                            closeLabel={closeLabel}
                            onClose={closeToTrigger}
                            closeRef={closeRef}
                        />

                        {children}

                        <FilterPanelFooter
                            resetLabel={resetLabel}
                            applyAriaLabel={applyAriaLabel}
                            applyMobileLabel={applyMobileLabel}
                            applyDesktopLabel={applyDesktopLabel}
                            onReset={onReset}
                            onApply={closeToTrigger}
                        />
                    </div>
                )}
            </div>
        </>
    );
};
