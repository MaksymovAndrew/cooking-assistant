import React from "react";

import { cx } from "utils/cx";

import styles from "./StatCard.module.scss";

interface StatCardProps {
    children: React.ReactNode;
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ children, className }) => (
    <div className={cx(styles["stat-card"], className)}>{children}</div>
);
