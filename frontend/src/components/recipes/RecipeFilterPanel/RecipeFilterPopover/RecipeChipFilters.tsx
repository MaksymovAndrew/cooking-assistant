import React from "react";
import { useTranslation } from "react-i18next";

import { ALLERGEN_SLUGS } from "constants/allergens";
import type { RecipeTypeSummary } from "types/recipeType";

import type { SetFilterValue } from "hooks/useListFilters";

import { FilterChipGroup } from "components/ui/FilterChipGroup";
import { LanguageFilterChips } from "components/ui/LanguageFilterChips";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";
import { resolveAllergen } from "utils/ingredientName";
import { recipeTypeName } from "utils/referenceLabels";

import { FilterSection } from "./FilterSection";

interface RecipeChipFiltersProps {
    filters: RecipeFilterState;
    setValue: SetFilterValue<RecipeFilterState>;
    types: RecipeTypeSummary[];
}

// the pick-any-of filters: recipe type, the language it is written in, allergens to leave out
export const RecipeChipFilters: React.FC<RecipeChipFiltersProps> = ({
    filters,
    setValue,
    types,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <>
            <FilterSection label={t("filterPanel.typeLabel")}>
                <FilterChipGroup
                    options={types.map((type) => ({
                        id: type.id,
                        label: recipeTypeName(t, type.type_name),
                    }))}
                    value={filters.types}
                    onChange={(next) => {
                        setValue("types", next);
                    }}
                />
            </FilterSection>

            <FilterSection label={t("common:contentLanguage.filterLabel")}>
                <LanguageFilterChips
                    value={filters.languages}
                    onChange={(next) => {
                        setValue("languages", next);
                    }}
                />
            </FilterSection>

            <FilterSection label={t("filterPanel.excludeAllergensLabel")}>
                <FilterChipGroup
                    options={ALLERGEN_SLUGS.map((slug) => ({
                        id: slug,
                        label: resolveAllergen(t, slug),
                    }))}
                    value={filters.excludeAllergens}
                    onChange={(next) => {
                        setValue("excludeAllergens", next);
                    }}
                />
            </FilterSection>
        </>
    );
};
