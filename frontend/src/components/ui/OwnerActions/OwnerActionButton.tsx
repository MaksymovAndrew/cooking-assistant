import React from "react";

import { useIsHydrated } from "hooks/useIsHydrated";

import styles from "./OwnerActions.module.scss";

interface OwnerActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    className: string;
}

// an icon on a phone, icon and label from tablet up; the accessible name never depends on the width
export const OwnerActionButton: React.FC<OwnerActionButtonProps> = ({
    icon,
    label,
    onClick,
    className,
}) => {
    // on screen from the server render; until React hydrates, a press would be silently swallowed
    const isHydrated = useIsHydrated();

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!isHydrated}
            aria-label={label}
            className={className}
        >
            {icon}
            <span className={styles["owner-actions__label"]}>{label}</span>
        </button>
    );
};
