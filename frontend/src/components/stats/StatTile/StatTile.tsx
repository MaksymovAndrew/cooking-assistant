import React from "react";

import styles from "./StatTile.module.scss";

interface StatTileProps {
    label: string;
    value: React.ReactNode;
    caption?: string;
    valueVariant?: "number" | "text";
}

export const StatTile: React.FC<StatTileProps> = ({
    label,
    value,
    caption,
    valueVariant = "number",
}) => (
    <div className={styles["stat-tile"]}>
        <span className={styles["stat-tile__label"]}>{label}</span>
        <span
            className={[
                styles["stat-tile__value"],
                styles[`stat-tile__value--${valueVariant}`],
            ].join(" ")}
        >
            {value}
        </span>
        {caption && (
            <span className={styles["stat-tile__caption"]}>{caption}</span>
        )}
    </div>
);
