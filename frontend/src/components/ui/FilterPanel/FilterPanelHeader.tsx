import { X } from "lucide-react";
import type { Ref } from "react";
import React from "react";

import styles from "./FilterPanel.module.scss";

interface FilterPanelHeaderProps {
    title: string;
    closeLabel: string;
    onClose: () => void;
    closeRef: Ref<HTMLButtonElement>;
}

const CLOSE_ICON_SIZE = 14;

export const FilterPanelHeader: React.FC<FilterPanelHeaderProps> = ({
    title,
    closeLabel,
    onClose,
    closeRef,
}) => (
    <div className={styles["filter-panel__header"]}>
        <span>{title}</span>
        <button
            ref={closeRef}
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className={styles["filter-panel__close"]}
        >
            <X size={CLOSE_ICON_SIZE} aria-hidden="true" />
        </button>
    </div>
);
