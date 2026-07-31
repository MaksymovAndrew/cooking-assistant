import { ListFilter, X } from "lucide-react";
import type { ReactNode } from "react";
import React, { useRef, useState } from "react";

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

    const closePopover = () => {
        setIsOpen(false);
    };

    usePopoverDismiss(containerRef, isOpen, closePopover);
    useScrollLock(isOpen);

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
