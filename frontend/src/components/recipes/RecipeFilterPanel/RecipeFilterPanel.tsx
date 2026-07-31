import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";
import type { RecipeTypeSummary } from "types/recipeType";

import type { SetFilterValue, SetFilterValues } from "hooks/useListFilters";

import { FilterPanel } from "components/ui/FilterPanel";
import { SearchField } from "components/ui/SearchField";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

import styles from "./RecipeFilterPanel.module.scss";
import { RecipeFilterPopover } from "./RecipeFilterPopover";

export interface RecipeFilterPanelProps {
    filters: RecipeFilterState;
    setValue: SetFilterValue<RecipeFilterState>;
    setValues: SetFilterValues<RecipeFilterState>;
    activeCount: number;
    types: RecipeTypeSummary[];
    ingredients: Ingredient[];
    searchPlaceholder: string;
    total: number;
    // bumped by the caller on a full reset ("Clear all") - remounts SearchField so it can't
    // commit a debounce that was still pending when the reset happened (see RecipeListView)
    searchResetKey?: number;
}

export const RecipeFilterPanel: React.FC<RecipeFilterPanelProps> = ({
    filters,
    setValue,
    setValues,
    activeCount,
    types,
    ingredients,
    searchPlaceholder,
    total,
    searchResetKey,
}) => {
    const { t } = useTranslation("recipes");
    const showResultsLabel = t("filterPanel.showResults", { count: total });
    // bumped alongside resetPanelFields, remounts the cooking-time inputs so a pending, still-
    // debouncing edit can't commit after "Reset filters" - the field's own value can already be
    // "" pre-reset (nothing typed has committed yet), so the prop alone wouldn't change
    const [popoverResetKey, setPopoverResetKey] = useState(0);

    // resets only the fields the popover itself controls, leaving the search box (rendered
    // outside the popover) untouched - resetFilters is the full reset, used by "Clear all".
    // one setValues() call, not several setValue() calls - each of those would read the
    // same pre-reset URL state from this closure, so only the last one would actually stick
    const resetPanelFields = () => {
        setValues({
            types: [],
            ingredients: [],
            cookingTime: { min: "", max: "" },
            sort: null,
            inPantry: false,
        });
        setPopoverResetKey((key) => key + 1);
    };

    return (
        <div className={styles["recipe-filter-panel"]}>
            <SearchField
                key={searchResetKey}
                placeholder={`${t("common:search.placeholderPrefix")} ${searchPlaceholder}`}
                value={filters.search}
                onChange={(value) => {
                    setValue("search", value, { replace: true });
                }}
            />
            <FilterPanel
                title={t("filterPanel.title")}
                closeLabel={t("filterPanel.close")}
                resetLabel={t("filterPanel.reset")}
                applyAriaLabel={showResultsLabel}
                applyMobileLabel={showResultsLabel}
                applyDesktopLabel={t("filterPanel.apply")}
                activeCount={activeCount}
                onReset={resetPanelFields}
            >
                <RecipeFilterPopover
                    key={searchResetKey}
                    filters={filters}
                    setValue={setValue}
                    types={types}
                    ingredients={ingredients}
                    fieldsResetKey={popoverResetKey}
                />
            </FilterPanel>
        </div>
    );
};
