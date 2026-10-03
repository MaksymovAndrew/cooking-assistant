import { ListFilter } from "lucide-react";
import type { Ref } from "react";
import React from "react";

import { cx } from "utils/cx";

import styles from "./FilterPanel.module.scss";

interface FilterPanelTriggerProps {
    title: string;
    activeCount: number;
    isOpen: boolean;
    onToggle: () => void;
    triggerRef: Ref<HTMLButtonElement>;
}

const FILTER_ICON_SIZE = 17;

export const FilterPanelTrigger: React.FC<FilterPanelTriggerProps> = ({
    title,
    activeCount,
    isOpen,
    onToggle,
    triggerRef,
}) => (
    <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cx(
            styles["filter-panel__trigger"],
            activeCount > 0 && styles["filter-panel__trigger--active"],
        )}
    >
        <ListFilter size={FILTER_ICON_SIZE} aria-hidden="true" />
        {title}
        {activeCount > 0 && (
            <span className={styles["filter-panel__badge"]}>{activeCount}</span>
        )}
    </button>
);
