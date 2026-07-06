import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeFilterState } from "hooks/useRecipeListView";

import styles from "./RecipeActiveFilters.module.scss";

interface RecipeActiveFiltersProps {
    total: number;
    filters: RecipeFilterState;
    setMinCookingTime: (time: string) => void;
    setMaxCookingTime: (time: string) => void;
    setSortOrder: (order: string) => void;
    setSelectedTypes: (types: number[]) => void;
}

const REMOVE_ICON_SIZE = 12;

const RemoveFilterButton: React.FC<{ onRemove: () => void }> = ({
    onRemove,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <button
            type="button"
            aria-label={t("filterPanel.removeFilter")}
            onClick={onRemove}
        >
            <X size={REMOVE_ICON_SIZE} aria-hidden="true" />
        </button>
    );
};

export const RecipeActiveFilters: React.FC<RecipeActiveFiltersProps> = ({
    total,
    filters,
    setMinCookingTime,
    setMaxCookingTime,
    setSortOrder,
    setSelectedTypes,
}) => {
    const { t } = useTranslation("recipes");
    const hasSort = filters.sortOrder !== "asc";
    const hasActiveFilters =
        Boolean(filters.minCookingTime) ||
        Boolean(filters.maxCookingTime) ||
        hasSort ||
        filters.selectedTypes.length > 0;

    const countLabel = (
        <span className={styles["recipe-active-filters__count"]}>
            {t("filterPanel.recipeCount", { count: total })}
        </span>
    );

    if (!hasActiveFilters) {
        return (
            <div className={styles["recipe-active-filters"]}>{countLabel}</div>
        );
    }

    const removeMinTime = () => {
        setMinCookingTime("");
    };
    const removeMaxTime = () => {
        setMaxCookingTime("");
    };
    const removeSort = () => {
        setSortOrder("asc");
    };
    const clearAll = () => {
        removeMinTime();
        removeMaxTime();
        removeSort();
        setSelectedTypes([]);
    };

    return (
        <div className={styles["recipe-active-filters"]}>
            {countLabel}
            <span className={styles["recipe-active-filters__divider"]} />
            {filters.minCookingTime && (
                <span className={styles["recipe-active-filters__chip"]}>
                    {t("filterPanel.minChip", {
                        minutes: filters.minCookingTime,
                    })}
                    <RemoveFilterButton onRemove={removeMinTime} />
                </span>
            )}
            {filters.maxCookingTime && (
                <span className={styles["recipe-active-filters__chip"]}>
                    {t("filterPanel.maxChip", {
                        minutes: filters.maxCookingTime,
                    })}
                    <RemoveFilterButton onRemove={removeMaxTime} />
                </span>
            )}
            {hasSort && (
                <span className={styles["recipe-active-filters__chip"]}>
                    {t("filterPanel.sortChip", {
                        sort: t("filterPanel.longToFast"),
                    })}
                    <RemoveFilterButton onRemove={removeSort} />
                </span>
            )}
            <button
                type="button"
                onClick={clearAll}
                className={styles["recipe-active-filters__clear"]}
            >
                {t("filterPanel.clearAll")}
            </button>
        </div>
    );
};
