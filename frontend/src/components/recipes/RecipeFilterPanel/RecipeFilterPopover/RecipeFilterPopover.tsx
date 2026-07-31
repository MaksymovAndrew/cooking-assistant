import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";
import type { RecipeTypeSummary } from "types/recipeType";

import type { SetFilterValue } from "hooks/useListFilters";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";
import { FilterChipGroup } from "components/ui/FilterChipGroup";
import type { SegmentedOption } from "components/ui/SegmentedControl";
import { SegmentedControl } from "components/ui/SegmentedControl";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

import { RecipeIngredientsFilter } from "./RecipeIngredientsFilter";
import { RecipePantryToggle } from "./RecipePantryToggle";
import { RecipeTimeRangeFields } from "./RecipeTimeRangeFields";

interface RecipeFilterPopoverProps {
    filters: RecipeFilterState;
    setValue: SetFilterValue<RecipeFilterState>;
    types: RecipeTypeSummary[];
    ingredients: Ingredient[];
    // bumped by RecipeFilterPanel's "Reset filters" - remounts the cooking-time fields so a
    // pending, still-debouncing edit can't commit after the reset (see RecipeFilterPanel)
    fieldsResetKey?: number;
}

const SORT_OPTIONS: readonly SegmentedOption<"asc" | "desc">[] = [
    { value: "asc", label: "filterPanel.fastToLong" },
    { value: "desc", label: "filterPanel.longToFast" },
];

export const RecipeFilterPopover: React.FC<RecipeFilterPopoverProps> = ({
    filters,
    setValue,
    types,
    ingredients,
    fieldsResetKey,
}) => {
    const { t } = useTranslation("recipes");

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
                <FilterChipGroup
                    options={types.map((type) => ({
                        id: type.id,
                        label: type.type_name,
                    }))}
                    value={filters.types}
                    onChange={(next) => {
                        setValue("types", next);
                    }}
                />
            </div>

            <RecipeIngredientsFilter
                allIngredients={ingredients}
                selectedIds={filters.ingredients}
                onChange={(next) => {
                    setValue("ingredients", next);
                }}
            />
        </>
    );
};
