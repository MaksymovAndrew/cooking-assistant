import React from "react";
import { useTranslation } from "react-i18next";

import type { SetFilterValue } from "hooks/useListFilters";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

import { RecipeCalorieRangeFields } from "./RecipeCalorieRangeFields";
import { RecipeTimeRangeFields } from "./RecipeTimeRangeFields";

interface RecipeRangeSectionsProps {
    filters: RecipeFilterState;
    setValue: SetFilterValue<RecipeFilterState>;
    // bumped by RecipeFilterPanel's "Reset filters" - remounts the fields so a pending,
    // still-debouncing edit can't commit after the reset (see RecipeFilterPanel)
    fieldsResetKey?: number;
}

export const RecipeRangeSections: React.FC<RecipeRangeSectionsProps> = ({
    filters,
    setValue,
    fieldsResetKey,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <>
            <div className={styles["recipe-filter-panel__section"]}>
                <span className={styles["recipe-filter-panel__label"]}>
                    {t("filterPanel.cookingTimeLabel")}
                </span>
                <RecipeTimeRangeFields
                    key={fieldsResetKey}
                    minCookingTime={filters.cookingTime.min}
                    maxCookingTime={filters.cookingTime.max}
                    setMinCookingTime={(time) => {
                        setValue(
                            "cookingTime",
                            { ...filters.cookingTime, min: time },
                            { replace: true },
                        );
                    }}
                    setMaxCookingTime={(time) => {
                        setValue(
                            "cookingTime",
                            { ...filters.cookingTime, max: time },
                            { replace: true },
                        );
                    }}
                />
            </div>

            <div className={styles["recipe-filter-panel__section"]}>
                <span className={styles["recipe-filter-panel__label"]}>
                    {t("filterPanel.caloriesLabel")}
                </span>
                <RecipeCalorieRangeFields
                    key={fieldsResetKey}
                    minCalories={filters.calories.min}
                    maxCalories={filters.calories.max}
                    setMinCalories={(calories) => {
                        setValue(
                            "calories",
                            { ...filters.calories, min: calories },
                            { replace: true },
                        );
                    }}
                    setMaxCalories={(calories) => {
                        setValue(
                            "calories",
                            { ...filters.calories, max: calories },
                            { replace: true },
                        );
                    }}
                />
            </div>
        </>
    );
};
