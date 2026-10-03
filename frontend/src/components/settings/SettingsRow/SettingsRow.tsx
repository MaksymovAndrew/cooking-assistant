import React from "react";

import { cx } from "utils/cx";

import styles from "./SettingsRow.module.scss";

// accepts both lucide-react icons and hand-authored components/icons/* glyphs
type SettingsRowIcon = React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
}>;

interface SettingsRowProps {
    icon: SettingsRowIcon;
    title: string;
    // a hint, which phones leave out, or the row's own value, which every width shows
    description?: string;
    value?: string;
    danger?: boolean;
    children: React.ReactNode;
}

const ICON_SIZE = 18;

export const SettingsRow: React.FC<SettingsRowProps> = ({
    icon: Icon,
    title,
    description,
    value,
    danger = false,
    children,
}) => {
    return (
        <div
            className={cx(
                styles["settings-row"],
                danger && styles["settings-row--danger"],
            )}
        >
            <Icon size={ICON_SIZE} aria-hidden="true" />
            <div className={styles["settings-row__text"]}>
                <div
                    className={cx(
                        styles["settings-row__title"],
                        danger && styles["settings-row__title--danger"],
                    )}
                >
                    {title}
                </div>
                {value && (
                    <div className={styles["settings-row__value"]}>{value}</div>
                )}
                {description && (
                    <div className={styles["settings-row__description"]}>
                        {description}
                    </div>
                )}
            </div>
            <div className={styles["settings-row__control"]}>{children}</div>
        </div>
    );
};
