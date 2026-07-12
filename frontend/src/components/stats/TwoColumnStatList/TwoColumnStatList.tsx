import React from "react";

import styles from "./TwoColumnStatList.module.scss";

export type StatListTone = "success" | "warning" | "brand" | "muted";

export interface StatListItem {
    key: string | number;
    name: string;
    value: string;
}

export interface StatListColumn {
    label: string;
    tone: StatListTone;
    items: StatListItem[];
}

interface TwoColumnStatListProps {
    left: StatListColumn;
    right: StatListColumn;
}

const StatListColumnView: React.FC<{ column: StatListColumn }> = ({
    column,
}) => (
    <div className={styles["two-column-stat-list__column"]}>
        <div
            className={[
                styles["two-column-stat-list__column-label"],
                styles[`two-column-stat-list__column-label--${column.tone}`],
            ].join(" ")}
        >
            {column.label}
        </div>
        <ul className={styles["two-column-stat-list__items"]}>
            {column.items.map((item) => (
                <li
                    key={item.key}
                    className={styles["two-column-stat-list__row"]}
                >
                    <span className={styles["two-column-stat-list__name"]}>
                        {item.name}
                    </span>
                    <span
                        className={[
                            styles["two-column-stat-list__chip"],
                            styles[
                                `two-column-stat-list__chip--${column.tone}`
                            ],
                        ].join(" ")}
                    >
                        {item.value}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

export const TwoColumnStatList: React.FC<TwoColumnStatListProps> = ({
    left,
    right,
}) => (
    <div className={styles["two-column-stat-list"]}>
        <StatListColumnView column={left} />
        <StatListColumnView column={right} />
    </div>
);
