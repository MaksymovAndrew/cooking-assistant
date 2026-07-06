import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./Chip.module.scss";

export type ChipVariant =
    "type" | "outline" | "success" | "warning" | "danger" | "numeric";

interface ChipProps {
    variant?: ChipVariant;
    icon?: React.ReactNode;
    removable?: boolean;
    onRemove?: () => void;
    children: React.ReactNode;
    className?: string;
}

const VARIANT_CLASS: Record<ChipVariant, string> = {
    type: styles["chip--type"],
    outline: styles["chip--outline"],
    success: styles["chip--success"],
    warning: styles["chip--warning"],
    danger: styles["chip--danger"],
    numeric: styles["chip--numeric"],
};

const REMOVE_ICON_SIZE = 13;

export const Chip: React.FC<ChipProps> = ({
    variant = "type",
    icon,
    removable = false,
    onRemove,
    children,
    className,
}) => {
    const { t } = useTranslation();

    const classNames = [styles.chip, VARIANT_CLASS[variant], className]
        .filter(Boolean)
        .join(" ");

    return (
        <span className={classNames}>
            {icon && (
                <span className={styles.chip__icon} aria-hidden="true">
                    {icon}
                </span>
            )}
            {children}
            {removable && (
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={t("chip.remove")}
                    className={styles.chip__remove}
                >
                    <X size={REMOVE_ICON_SIZE} aria-hidden="true" />
                </button>
            )}
        </span>
    );
};
