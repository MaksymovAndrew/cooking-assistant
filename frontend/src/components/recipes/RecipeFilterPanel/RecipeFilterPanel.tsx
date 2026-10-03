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
    // bumped on "Clear all" to remount SearchField and drop a pending debounce
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
    // remounts the range fields on reset so a still-debouncing edit can't commit after it
    const [popoverResetKey, setPopoverResetKey] = useState(0);

    // one setValues call: separate setValue calls would each read the same pre-reset URL
    const resetPanelFields = () => {
        setValues({
            types: [],
            ingredients: [],
            cookingTime: { min: "", max: "" },
            calories: { min: "", max: "" },
            sort: null,
            inPantry: false,
            favourites: false,
            topRated: false,
            excludeAllergens: [],
            hideAvoided: false,
            tags: [],
            languages: [],
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
