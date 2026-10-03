import React from "react";
import { useTranslation } from "react-i18next";

import { type Locale, LOCALE_BADGES } from "constants/locales";

import { cx } from "utils/cx";

import styles from "./LanguageBadge.module.scss";

export type LanguageBadgeTone = "plain" | "overlay";

interface LanguageBadgeProps {
    language: Locale;
    tone?: LanguageBadgeTone;
    className?: string;
}

export const LanguageBadge: React.FC<LanguageBadgeProps> = ({
    language,
    tone = "plain",
    className,
}) => {
    const { t } = useTranslation();
    const label = t(`contentLanguage.in.${language}`);
    const classNames = cx(
        styles["language-badge"],
        styles[`language-badge--${tone}`],
        className,
    );

    return (
        <span className={classNames} title={label}>
            <span aria-hidden="true">{LOCALE_BADGES[language]}</span>
            <span className={styles["language-badge__label"]}>{label}</span>
        </span>
    );
};
