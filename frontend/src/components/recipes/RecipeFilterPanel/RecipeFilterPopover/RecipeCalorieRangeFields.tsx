import React from "react";
import { useTranslation } from "react-i18next";

import { useDebouncedFieldSync } from "hooks/useDebouncedFieldSync";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";

interface RecipeCalorieRangeFieldsProps {
    minCalories: string;
    maxCalories: string;
    setMinCalories: (calories: string) => void;
    setMaxCalories: (calories: string) => void;
}

// same debounce-then-single-write pattern as RecipeTimeRangeFields
export const RecipeCalorieRangeFields: React.FC<
    RecipeCalorieRangeFieldsProps
> = ({ minCalories, maxCalories, setMinCalories, setMaxCalories }) => {
    const { t } = useTranslation("recipes");
    const [localMin, setLocalMin] = useDebouncedFieldSync(
        minCalories,
        setMinCalories,
    );
    const [localMax, setLocalMax] = useDebouncedFieldSync(
        maxCalories,
        setMaxCalories,
    );

    return (
        <div className={styles["recipe-filter-panel__time-row"]}>
            <label className={styles["recipe-filter-panel__time-field"]}>
                <span>{t("filterPanel.min")}</span>
                <input
                    type="number"
                    min="0"
                    value={localMin}
                    onChange={(e) => {
                        setLocalMin(e.target.value);
                    }}
                    className={styles["recipe-filter-panel__time-input"]}
                />
            </label>
            <label className={styles["recipe-filter-panel__time-field"]}>
                <span>{t("filterPanel.max")}</span>
                <input
                    type="number"
                    min="1"
                    value={localMax}
                    onChange={(e) => {
                        setLocalMax(e.target.value);
                    }}
                    className={styles["recipe-filter-panel__time-input"]}
                />
            </label>
        </div>
    );
};
