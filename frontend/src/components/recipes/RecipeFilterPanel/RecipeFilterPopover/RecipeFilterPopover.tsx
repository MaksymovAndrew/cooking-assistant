import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeTypeSummary } from "types/recipeType";

import type { SetFilterValue } from "hooks/useListFilters";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";
import { RecipeTypeToggle } from "components/recipes/RecipeFilterPanel/RecipeTypeToggle";
import type { SegmentedOption } from "components/ui/SegmentedControl";
import { SegmentedControl } from "components/ui/SegmentedControl";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

import { RecipePantryToggle } from "./RecipePantryToggle";
import { RecipeTimeRangeFields } from "./RecipeTimeRangeFields";

interface RecipeFilterPopoverProps {
    filters: RecipeFilterState;
    setValue: SetFilterValue<RecipeFilterState>;
    types: RecipeTypeSummary[];
}

const SORT_OPTIONS: readonly SegmentedOption<"asc" | "desc">[] = [
    { value: "asc", label: "filterPanel.fastToLong" },
    { value: "desc", label: "filterPanel.longToFast" },
];

export const RecipeFilterPopover: React.FC<RecipeFilterPopoverProps> = ({
    filters,
    setValue,
    types,
}) => {
    const { t } = useTranslation("recipes");

    const toggleType = (id: number) => {
        setValue(
            "types",
            filters.types.includes(id)
                ? filters.types.filter((value) => value !== id)
                : [...filters.types, id],
        );
    };

    return (
        <>
            <RecipePantryToggle
                checked={filters.inPantry}
                onChange={(value) => {
                    setValue("inPantry", value);
                }}
            />

            <div className={styles["recipe-filter-panel__section"]}>
                <span className={styles["recipe-filter-panel__label"]}>
                    {t("filterPanel.cookingTimeLabel")}
                </span>
                <RecipeTimeRangeFields
                    minCookingTime={filters.cookingTime.min}
                    maxCookingTime={filters.cookingTime.max}
                    setMinCookingTime={(time) => {
                        setValue("cookingTime", {
                            ...filters.cookingTime,
                            min: time,
                        });
                    }}
                    setMaxCookingTime={(time) => {
                        setValue("cookingTime", {
                            ...filters.cookingTime,
                            max: time,
                        });
                    }}
                />
            </div>

            <div className={styles["recipe-filter-panel__section"]}>
                <span className={styles["recipe-filter-panel__label"]}>
                    {t("filterPanel.sortLabel")}
                </span>
                <SegmentedControl
                    label={t("filterPanel.sortLabel")}
                    value={filters.sort}
                    onChange={(value) => {
                        setValue("sort", value);
                    }}
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
                            selected={filters.types.includes(type.id)}
                            onToggle={() => {
                                toggleType(type.id);
                            }}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};
