import React from "react";
import { useTranslation } from "react-i18next";

import type { SetFilterValue } from "hooks/useListFilters";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

import { FilterSection } from "./FilterSection";
import { RecipeRangeFields } from "./RecipeRangeFields";

interface RecipeRangeSectionsProps {
    filters: RecipeFilterState;
    setValue: SetFilterValue<RecipeFilterState>;
    // bumped by RecipeFilterPanel's "Reset filters" - remounts the fields so a pending,
    // still-debouncing edit can't commit after the reset (see RecipeFilterPanel)
    fieldsResetKey?: number;
}

const RANGE_SECTIONS = [
    { key: "cookingTime", labelKey: "filterPanel.cookingTimeLabel" },
    { key: "calories", labelKey: "filterPanel.caloriesLabel" },
] as const;

export const RecipeRangeSections: React.FC<RecipeRangeSectionsProps> = ({
    filters,
    setValue,
    fieldsResetKey,
}) => {
    const { t } = useTranslation("recipes");

    return RANGE_SECTIONS.map(({ key, labelKey }) => (
        <FilterSection key={key} label={t(labelKey)}>
            <RecipeRangeFields
                key={fieldsResetKey}
                value={filters[key]}
                onChange={(range) => {
                    setValue(key, range, { replace: true });
                }}
            />
        </FilterSection>
    ));
};
