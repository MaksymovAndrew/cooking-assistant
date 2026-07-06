import React from "react";

import styles from "./StatCard.module.scss";

interface StatCardProps {
    children: React.ReactNode;
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ children, className }) => (
    <div className={[styles["stat-card"], className].filter(Boolean).join(" ")}>
        {children}
    </div>
);
