import React from "react";

import styles from "./EmptyState.module.scss";

// accepts both lucide-react icons and hand-authored components/icons/* glyphs
type EmptyStateIcon = React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
}>;

interface EmptyStateProps {
    icon: EmptyStateIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

const ICON_SIZE = 40;

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action,
}) => (
    <div className={styles["empty-state"]}>
        <span className={styles["empty-state__icon"]}>
            <Icon size={ICON_SIZE} aria-hidden="true" />
        </span>
        <h2 className={styles["empty-state__title"]}>{title}</h2>
        {description && (
            <p className={styles["empty-state__description"]}>{description}</p>
        )}
        {action && (
            <div className={styles["empty-state__action"]}>{action}</div>
        )}
    </div>
);
