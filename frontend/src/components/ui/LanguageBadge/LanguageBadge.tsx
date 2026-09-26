import React from "react";
import { useTranslation } from "react-i18next";

import { type Locale, LOCALE_BADGES } from "constants/locales";

import styles from "./LanguageBadge.module.scss";

export type LanguageBadgeTone = "plain" | "overlay";

interface LanguageBadgeProps {
    language: Locale;
    // overlay sits on a photo, plain on the page surface
    tone?: LanguageBadgeTone;
    className?: string;
}

// the short code is for the eye; a screen reader hears the language spelled out instead
export const LanguageBadge: React.FC<LanguageBadgeProps> = ({
    language,
    tone = "plain",
    className,
}) => {
    const { t } = useTranslation();
    const label = t(`contentLanguage.in.${language}`);
    const classNames = [
        styles["language-badge"],
        styles[`language-badge--${tone}`],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <span className={classNames} title={label}>
            <span aria-hidden="true">{LOCALE_BADGES[language]}</span>
            <span className={styles["language-badge__label"]}>{label}</span>
        </span>
    );
};
