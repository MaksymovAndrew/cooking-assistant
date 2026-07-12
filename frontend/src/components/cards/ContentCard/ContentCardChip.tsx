import React from "react";

import styles from "./ContentCard.module.scss";

export const ContentCardChip: React.FC<{ isRow: boolean; label: string }> = ({
    isRow,
    label,
}) => (
    <span
        className={[
            styles["content-card__chip"],
            isRow && styles["content-card__chip--row"],
        ]
            .filter(Boolean)
            .join(" ")}
    >
        {label}
    </span>
);
