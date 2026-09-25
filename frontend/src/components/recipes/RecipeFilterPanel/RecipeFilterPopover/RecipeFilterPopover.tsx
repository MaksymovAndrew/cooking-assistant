import React from "react";
import { useTranslation } from "react-i18next";

import { ALLERGEN_SLUGS } from "constants/allergens";
import type { Ingredient } from "types/ingredient";
import type { RecipeTypeSummary } from "types/recipeType";

import type { SetFilterValue } from "hooks/useListFilters";

import { FilterChipGroup } from "components/ui/FilterChipGroup";
import type { SegmentedOption } from "components/ui/SegmentedControl";
import { SegmentedControl } from "components/ui/SegmentedControl";

import type {
    RecipeFilterState,
    RecipeSort,
} from "utils/filters/recipeFilterDefs";
import { resolveAllergen } from "utils/ingredientName";

import { FilterSection } from "./FilterSection";
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

const SORT_OPTIONS: readonly SegmentedOption<RecipeSort>[] = [
    { value: "asc", label: "filterPanel.fastToLong" },
    { value: "desc", label: "filterPanel.longToFast" },
    { value: "rating", label: "filterPanel.topRated" },
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

            <FilterSection label={t("filterPanel.sortLabel")}>
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
            </FilterSection>

            <FilterSection label={t("filterPanel.typeLabel")}>
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
