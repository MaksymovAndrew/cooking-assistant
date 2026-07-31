import { X } from "lucide-react";
import type { ReactNode } from "react";
import React from "react";

import styles from "./ActiveFilterChips.module.scss";

export interface ActiveFilterChip {
    key: string;
    label: string;
    onRemove: () => void;
}

export interface ActiveFilterChipsProps {
    countLabel: ReactNode;
    chips: ActiveFilterChip[];
    hasActiveFilters: boolean;
    onClearAll: () => void;
    clearAllLabel: string;
    removeLabel: string;
}

const REMOVE_ICON_SIZE = 12;

// generic active-filter row shared by every filterable list (recipes, menus, ...):
// a result-count label, one removable chip per active filter, and a clear-all button
export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
    countLabel,
    chips,
    hasActiveFilters,
    onClearAll,
    clearAllLabel,
    removeLabel,
}) => {
    const count = (
        <span className={styles["active-filter-chips__count"]}>
            {countLabel}
        </span>
    );

    if (!hasActiveFilters) {
        return <div className={styles["active-filter-chips"]}>{count}</div>;
    }

    return (
        <div className={styles["active-filter-chips"]}>
            {count}
            <span className={styles["active-filter-chips__divider"]} />
            {chips.map((chip) => (
                <span
                    key={chip.key}
                    className={styles["active-filter-chips__chip"]}
                >
                    {chip.label}
                    <button
                        type="button"
                        aria-label={`${removeLabel} ${chip.label}`}
                        onClick={chip.onRemove}
                    >
                        <X size={REMOVE_ICON_SIZE} aria-hidden="true" />
                    </button>
                </span>
            ))}
            <button
                type="button"
                onClick={onClearAll}
                className={styles["active-filter-chips__clear"]}
            >
                {clearAllLabel}
            </button>
        </div>
    );
};
