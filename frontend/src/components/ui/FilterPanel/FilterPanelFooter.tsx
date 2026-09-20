import React from "react";

import styles from "./FilterPanel.module.scss";

interface FilterPanelFooterProps {
    resetLabel: string;
    applyAriaLabel: string;
    applyMobileLabel: string;
    applyDesktopLabel: string;
    onReset: () => void;
    onApply: () => void;
}

export const FilterPanelFooter: React.FC<FilterPanelFooterProps> = ({
    resetLabel,
    applyAriaLabel,
    applyMobileLabel,
    applyDesktopLabel,
    onReset,
    onApply,
}) => (
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
            onClick={onApply}
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
                className={styles["filter-panel__apply-desktop"]}
            >
                {applyDesktopLabel}
            </span>
        </button>
    </div>
);
