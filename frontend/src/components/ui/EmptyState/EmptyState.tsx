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
    // h1 where the empty state is the whole page
    titleAs?: "h1" | "h2";
}

const ICON_SIZE = 40;

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action,
    titleAs: Title = "h2",
}) => (
    <div className={styles["empty-state"]}>
        <span className={styles["empty-state__icon"]}>
            <Icon size={ICON_SIZE} aria-hidden="true" />
        </span>
        <Title className={styles["empty-state__title"]}>{title}</Title>
        {description && (
            <p className={styles["empty-state__description"]}>{description}</p>
        )}
        {action && (
            <div className={styles["empty-state__action"]}>{action}</div>
        )}
    </div>
);
