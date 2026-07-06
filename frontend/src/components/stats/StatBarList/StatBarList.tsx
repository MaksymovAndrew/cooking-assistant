import React from "react";

import styles from "./StatBarList.module.scss";

export interface StatBarItem {
    label: string;
    value: number;
    displayValue: string;
}

interface StatBarListProps {
    items: StatBarItem[];
}

export const StatBarList: React.FC<StatBarListProps> = ({ items }) => {
    const maxValue = Math.max(...items.map((item) => item.value), 1);

    return (
        <ul className={styles["stat-bar-list"]}>
            {items.map((item) => (
                <li key={item.label} className={styles["stat-bar-list__row"]}>
                    <span className={styles["stat-bar-list__label"]}>
                        {item.label}
                    </span>
                    <span className={styles["stat-bar-list__track"]}>
                        <span
                            className={styles["stat-bar-list__fill"]}
                            style={{
                                width: `${(item.value / maxValue) * 100}%`,
                            }}
                        />
                    </span>
                    <span className={styles["stat-bar-list__value"]}>
                        {item.displayValue}
                    </span>
                </li>
            ))}
        </ul>
    );
};
