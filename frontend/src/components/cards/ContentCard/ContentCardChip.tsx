import React from "react";

import { cx } from "utils/cx";

import styles from "./ContentCard.module.scss";

export const ContentCardChip: React.FC<{ isRow: boolean; label: string }> = ({
    isRow,
    label,
}) => (
    <span
        className={cx(
            styles["content-card__chip"],
            isRow && styles["content-card__chip--row"],
        )}
    >
        {label}
    </span>
);
