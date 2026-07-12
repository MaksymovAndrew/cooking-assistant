import { Heart } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./ContentCard.module.scss";

const HEART_ICON_SIZE = 18;

export const ContentCardFavourite: React.FC<{
    isRow: boolean;
    active: boolean;
}> = ({ isRow, active }) => {
    const { t } = useTranslation();

    return (
        <button
            type="button"
            disabled
            aria-label={t("contentCard.favourite")}
            className={[
                styles["content-card__favourite"],
                isRow && styles["content-card__favourite--row"],
                active && styles["content-card__favourite--active"],
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <Heart size={HEART_ICON_SIZE} aria-hidden="true" />
        </button>
    );
};
