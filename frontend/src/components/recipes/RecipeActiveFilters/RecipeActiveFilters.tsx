import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { RECIPE_DEFAULT_SORT_ORDER } from "redux/slices/filtersSlice";

import type { RecipeFilterState } from "hooks/useRecipeListView";

import { hasActiveRecipeFilters } from "utils/recipeFilterParams";

import styles from "./RecipeActiveFilters.module.scss";

interface RecipeActiveFiltersProps {
    total: number;
    filters: RecipeFilterState;
    setMinCookingTime: (time: string) => void;
    setMaxCookingTime: (time: string) => void;
    setSortOrder: (order: string) => void;
    setInPantry: (value: boolean) => void;
    clearFilters: () => void;
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
    setInPantry,
    clearFilters,
}) => {
    const { t } = useTranslation("recipes");
    const [, setSearchParams] = useSearchParams();
    const hasSort = filters.sortOrder !== RECIPE_DEFAULT_SORT_ORDER;
    const hasActiveFilters = hasActiveRecipeFilters(filters);

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

    const removeSearch = () => {
        setSearchParams({});
    };
    const removeMinTime = () => {
        setMinCookingTime("");
    };
    const removeMaxTime = () => {
        setMaxCookingTime("");
    };
    const removeSort = () => {
        setSortOrder(RECIPE_DEFAULT_SORT_ORDER);
    };
    const removeInPantry = () => {
        setInPantry(false);
    };

    return (
        <div className={styles["recipe-active-filters"]}>
            {countLabel}
            <span className={styles["recipe-active-filters__divider"]} />
            {filters.ingredientName && (
                <span className={styles["recipe-active-filters__chip"]}>
                    {t("filterPanel.searchChip", {
                        query: filters.ingredientName,
                    })}
                    <RemoveFilterButton onRemove={removeSearch} />
                </span>
            )}
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
            {filters.inPantry && (
                <span className={styles["recipe-active-filters__chip"]}>
                    {t("filterPanel.inPantryChip")}
                    <RemoveFilterButton onRemove={removeInPantry} />
                </span>
            )}
            <button
                type="button"
                onClick={clearFilters}
                className={styles["recipe-active-filters__clear"]}
            >
                {t("filterPanel.clearAll")}
            </button>
        </div>
    );
};
