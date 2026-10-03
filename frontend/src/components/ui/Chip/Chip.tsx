import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { cx } from "utils/cx";

import styles from "./Chip.module.scss";

export type ChipVariant =
    "type" | "outline" | "success" | "warning" | "danger" | "numeric";

// a removable chip names what its remove button takes away
type ChipRemoval =
    | { removable?: false; onRemove?: never; name?: never }
    | { removable: true; onRemove: () => void; name: string };

type ChipProps = ChipRemoval & {
    variant?: ChipVariant;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
};

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
    name,
    children,
    className,
}) => {
    const { t } = useTranslation();

    const classNames = cx(styles.chip, VARIANT_CLASS[variant], className);

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
                    aria-label={t("chip.remove", { name })}
                    className={styles.chip__remove}
                >
                    <X size={REMOVE_ICON_SIZE} aria-hidden="true" />
                </button>
            )}
        </span>
    );
};
