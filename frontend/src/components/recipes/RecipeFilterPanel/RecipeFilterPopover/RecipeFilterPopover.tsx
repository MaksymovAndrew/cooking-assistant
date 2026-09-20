import React from "react";
import { useTranslation } from "react-i18next";

import { ALLERGEN_SLUGS } from "constants/allergens";
import type { Ingredient } from "types/ingredient";
import type { RecipeTypeSummary } from "types/recipeType";

import type { SetFilterValue } from "hooks/useListFilters";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";
import { FilterChipGroup } from "components/ui/FilterChipGroup";
import type { SegmentedOption } from "components/ui/SegmentedControl";
import { SegmentedControl } from "components/ui/SegmentedControl";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";
import { resolveAllergen } from "utils/ingredientName";

import { RecipeFilterToggles } from "./RecipeFilterToggles";
import { RecipeIngredientsFilter } from "./RecipeIngredientsFilter";
import { RecipeRangeSections } from "./RecipeRangeSections";
import { RecipeTagsFilter } from "./RecipeTagsFilter";

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
            <RecipeFilterToggles filters={filters} setValue={setValue} />

            <RecipeRangeSections
                filters={filters}
                setValue={setValue}
                fieldsResetKey={fieldsResetKey}
            />

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

            <div className={styles["recipe-filter-panel__section"]}>
                <span className={styles["recipe-filter-panel__label"]}>
                    {t("filterPanel.excludeAllergensLabel")}
                </span>
                <FilterChipGroup
                    options={ALLERGEN_SLUGS.map((slug) => ({
                        id: slug,
                        label: resolveAllergen(slug),
                    }))}
                    value={filters.excludeAllergens}
                    onChange={(next) => {
                        setValue("excludeAllergens", next);
                    }}
                />
            </div>

            <RecipeTagsFilter
                value={filters.tags}
                onChange={(next) => {
                    setValue("tags", next);
                }}
            />

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
