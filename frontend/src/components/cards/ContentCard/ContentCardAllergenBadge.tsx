import React from "react";
import { useTranslation } from "react-i18next";

import { AlertTriangleMark } from "components/icons";

import styles from "./ContentCard.module.scss";

const ALLERGEN_ICON_SIZE = 11;

export const ContentCardAllergenBadge: React.FC<{ isRow: boolean }> = ({
    isRow,
}) => {
    const { t } = useTranslation();

    return (
        <span
            title={t("contentCard.containsAllergens")}
            className={[
                styles["content-card__allergen-badge"],
                isRow && styles["content-card__allergen-badge--row"],
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <AlertTriangleMark size={ALLERGEN_ICON_SIZE} aria-hidden="true" />
            {!isRow && t("contentCard.allergens")}
        </span>
    );
};
