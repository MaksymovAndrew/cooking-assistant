import React from "react";
import { useTranslation } from "react-i18next";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";

interface RecipeTimeRangeFieldsProps {
    minCookingTime: string;
    maxCookingTime: string;
    setMinCookingTime: (time: string) => void;
    setMaxCookingTime: (time: string) => void;
}

export const RecipeTimeRangeFields: React.FC<RecipeTimeRangeFieldsProps> = ({
    minCookingTime,
    maxCookingTime,
    setMinCookingTime,
    setMaxCookingTime,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <div className={styles["recipe-filter-panel__time-row"]}>
            <label className={styles["recipe-filter-panel__time-field"]}>
                <span>{t("filterPanel.min")}</span>
                <input
                    type="number"
                    min="0"
                    value={minCookingTime}
                    onChange={(e) => {
                        setMinCookingTime(e.target.value);
                    }}
                    className={styles["recipe-filter-panel__time-input"]}
                />
            </label>
            <label className={styles["recipe-filter-panel__time-field"]}>
                <span>{t("filterPanel.max")}</span>
                <input
                    type="number"
                    min="1"
                    value={maxCookingTime}
                    onChange={(e) => {
                        setMaxCookingTime(e.target.value);
                    }}
                    className={styles["recipe-filter-panel__time-input"]}
                />
            </label>
        </div>
    );
};
