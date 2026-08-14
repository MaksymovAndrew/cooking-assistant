import React from "react";
import { useTranslation } from "react-i18next";

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
    // the one shared "not available yet" affordance - a badge next to the title, visible at
    // every breakpoint (unlike the description, which is hidden on mobile), so a disabled row
    // always reads as deliberate rather than broken
    comingSoon?: boolean;
    children: React.ReactNode;
}

const ICON_SIZE = 18;

export const SettingsRow: React.FC<SettingsRowProps> = ({
    icon: Icon,
    title,
    description,
    danger = false,
    disabled = false,
    comingSoon = false,
    children,
}) => {
    const { t } = useTranslation("settings");

    return (
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
                    {comingSoon && (
                        <span className={styles["settings-row__badge"]}>
                            {t("comingSoonBadge")}
                        </span>
                    )}
                </div>
                <div className={styles["settings-row__description"]}>
                    {description}
                </div>
            </div>
            <div className={styles["settings-row__control"]}>{children}</div>
        </div>
    );
};
