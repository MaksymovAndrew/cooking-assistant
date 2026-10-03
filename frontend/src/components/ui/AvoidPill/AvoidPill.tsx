import { Ban } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { cx } from "utils/cx";

import styles from "./AvoidPill.module.scss";

const ICON_SIZE = 11;

interface AvoidPillProps {
    // icon only, for a row card with no room for the label
    compact?: boolean;
}

// the personal "you avoid this" mark - brand purple, never the amber of the generic allergen warning
export const AvoidPill: React.FC<AvoidPillProps> = ({ compact = false }) => {
    const { t } = useTranslation("dietPreferences");

    return (
        <span
            title={t("avoidedRow")}
            className={cx(
                styles["avoid-pill"],
                compact && styles["avoid-pill--compact"],
            )}
        >
            <Ban size={ICON_SIZE} aria-hidden="true" />
            {compact ? (
                <span className={styles["avoid-pill__label"]}>
                    {t("avoidPill")}
                </span>
            ) : (
                t("avoidPill")
            )}
        </span>
    );
};
