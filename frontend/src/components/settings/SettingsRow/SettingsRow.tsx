import React from "react";

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
    description: string;
    danger?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}

const ICON_SIZE = 18;

export const SettingsRow: React.FC<SettingsRowProps> = ({
    icon: Icon,
    title,
    description,
    danger = false,
    disabled = false,
    children,
}) => (
    <div
        className={[
            styles["settings-row"],
            danger && styles["settings-row--danger"],
            disabled && styles["settings-row--disabled"],
        ]
            .filter(Boolean)
            .join(" ")}
    >
        <Icon size={ICON_SIZE} aria-hidden="true" />
        <div className={styles["settings-row__text"]}>
            <div
                className={[
                    styles["settings-row__title"],
                    danger && styles["settings-row__title--danger"],
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {title}
            </div>
            <div className={styles["settings-row__description"]}>
                {description}
            </div>
        </div>
        <div className={styles["settings-row__control"]}>{children}</div>
    </div>
);
