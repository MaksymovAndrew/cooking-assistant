import type { LucideIcon } from "lucide-react";
import React from "react";

import styles from "./StatCard.module.scss";

interface StatCardProps {
    icon: LucideIcon;
    value: number;
    label: string;
    // shown instead of label below desktop, per the mockup's compact tiles
    shortLabel?: string;
    tone?: "default" | "warning";
}

const ICON_SIZE = 22;

export const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    value,
    label,
    shortLabel,
    tone = "default",
}) => {
    const cardClass = [
        styles["stat-card"],
        tone === "warning" && styles["stat-card--warning"],
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={cardClass}>
            <span className={styles["stat-card__icon"]}>
                <Icon size={ICON_SIZE} aria-hidden="true" />
            </span>
            <span>
                <span className={styles["stat-card__value"]}>{value}</span>
                <span className={styles["stat-card__label--desktop"]}>
                    {label}
                </span>
                <span className={styles["stat-card__label--short"]}>
                    {shortLabel ?? label}
                </span>
            </span>
        </div>
    );
};
