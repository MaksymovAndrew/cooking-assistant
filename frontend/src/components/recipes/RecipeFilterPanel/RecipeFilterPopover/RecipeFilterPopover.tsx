import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeTypeSummary } from "types/recipeType";

import { RECIPE_DEFAULT_SORT_ORDER } from "redux/slices/filtersSlice";

import type { RecipeFilterState } from "hooks/useRecipeListView";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";
import { RecipeTypeToggle } from "components/recipes/RecipeFilterPanel/RecipeTypeToggle";
import type { SegmentedOption } from "components/ui/SegmentedControl";
import { SegmentedControl } from "components/ui/SegmentedControl";

import { RecipeTimeRangeFields } from "./RecipeTimeRangeFields";

interface RecipeFilterPopoverProps {
    filters: RecipeFilterState;
    setSelectedTypes: (types: number[]) => void;
    setMinCookingTime: (time: string) => void;
    setMaxCookingTime: (time: string) => void;
    setSortOrder: (order: string) => void;
    types: RecipeTypeSummary[];
    total: number;
    onClose: () => void;
}

const CLOSE_ICON_SIZE = 14;
const SORT_OPTIONS: readonly SegmentedOption<string>[] = [
    { value: "asc", label: "filterPanel.fastToLong" },
    { value: "desc", label: "filterPanel.longToFast" },
];

export const RecipeFilterPopover: React.FC<RecipeFilterPopoverProps> = ({
    filters,
    setSelectedTypes,
    setMinCookingTime,
    setMaxCookingTime,
    setSortOrder,
    types,
    total,
    onClose,
}) => {
    const { t } = useTranslation("recipes");

    const toggleType = (id: number) => {
        setSelectedTypes(
            filters.selectedTypes.includes(id)
                ? filters.selectedTypes.filter((value) => value !== id)
                : [...filters.selectedTypes, id],
        );
    };

    const resetAll = () => {
        setSelectedTypes([]);
        setMinCookingTime("");
        setMaxCookingTime("");
        setSortOrder(RECIPE_DEFAULT_SORT_ORDER);
    };

    return (
        <div
            role="dialog"
            aria-label={t("filterPanel.title")}
            className={styles["recipe-filter-panel__popover"]}
        >
            <div className={styles["recipe-filter-panel__header"]}>
                <span>{t("filterPanel.title")}</span>
                <button
                    type="button"
                    aria-label={t("filterPanel.close")}
                    onClick={onClose}
                    className={styles["recipe-filter-panel__close"]}
                >
                    <X size={CLOSE_ICON_SIZE} aria-hidden="true" />
                </button>
            </div>

            <div className={styles["recipe-filter-panel__section"]}>
                <span className={styles["recipe-filter-panel__label"]}>
                    {t("filterPanel.cookingTimeLabel")}
                </span>
                <RecipeTimeRangeFields
                    minCookingTime={filters.minCookingTime}
                    maxCookingTime={filters.maxCookingTime}
                    setMinCookingTime={setMinCookingTime}
                    setMaxCookingTime={setMaxCookingTime}
                />
            </div>

            <div className={styles["recipe-filter-panel__section"]}>
                <span className={styles["recipe-filter-panel__label"]}>
                    {t("filterPanel.sortLabel")}
                </span>
                <SegmentedControl
                    label={t("filterPanel.sortLabel")}
                    value={filters.sortOrder}
                    onChange={setSortOrder}
                    options={SORT_OPTIONS.map((option) => ({
                        ...option,
                        label: t(option.label),
                    }))}
                />
            </div>

            <div className={styles["recipe-filter-panel__section"]}>
                <span className={styles["recipe-filter-panel__label"]}>
                    {t("filterPanel.typeLabel")}
                </span>
                <div className={styles["recipe-filter-panel__type-list"]}>
                    {types.map((type) => (
                        <RecipeTypeToggle
                            key={type.id}
                            label={type.type_name}
                            selected={filters.selectedTypes.includes(type.id)}
                            onToggle={() => {
                                toggleType(type.id);
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className={styles["recipe-filter-panel__footer"]}>
                <button
                    type="button"
                    onClick={resetAll}
                    className={styles["recipe-filter-panel__reset-button"]}
                >
                    {t("filterPanel.reset")}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t("filterPanel.showResults", { count: total })}
                    className={styles["recipe-filter-panel__apply-button"]}
                >
                    <span
                        aria-hidden="true"
                        className={styles["recipe-filter-panel__apply-mobile"]}
                    >
                        {t("filterPanel.showResults", { count: total })}
                    </span>
                    <span
                        aria-hidden="true"
                        className={styles["recipe-filter-panel__apply-desktop"]}
                    >
                        {t("filterPanel.apply")}
                    </span>
                </button>
            </div>
        </div>
    );
};
