import React from "react";

import styles from "./StatTile.module.scss";

interface StatTileProps {
    label: string;
    value: React.ReactNode;
    caption?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
    label,
    value,
    caption,
}) => (
    <div className={styles["stat-tile"]}>
        <span className={styles["stat-tile__label"]}>{label}</span>
        <span className={styles["stat-tile__value"]}>{value}</span>
        {caption && (
            <span className={styles["stat-tile__caption"]}>{caption}</span>
        )}
    </div>
);
