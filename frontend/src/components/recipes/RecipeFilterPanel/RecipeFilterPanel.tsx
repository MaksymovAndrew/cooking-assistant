import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeTypeSummary } from "types/recipeType";

import type { SetFilterValue } from "hooks/useListFilters";

import { FilterPanel } from "components/ui/FilterPanel";
import { SearchComponent } from "components/ui/SearchComponent";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

import styles from "./RecipeFilterPanel.module.scss";
import { RecipeFilterPopover } from "./RecipeFilterPopover";

export interface RecipeFilterPanelProps {
    filters: RecipeFilterState;
    setValue: SetFilterValue<RecipeFilterState>;
    resetFilters: () => void;
    activeCount: number;
    types: RecipeTypeSummary[];
    searchPlaceholder: string;
    total: number;
}

export const RecipeFilterPanel: React.FC<RecipeFilterPanelProps> = ({
    filters,
    setValue,
    resetFilters,
    activeCount,
    types,
    searchPlaceholder,
    total,
}) => {
    const { t } = useTranslation("recipes");
    const showResultsLabel = t("filterPanel.showResults", { count: total });

    return (
        <div className={styles["recipe-filter-panel"]}>
            <SearchComponent
                placeholder={searchPlaceholder}
                value={filters.search}
                onSubmit={(value) => {
                    setValue("search", value);
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
                onReset={resetFilters}
            >
                <RecipeFilterPopover
                    filters={filters}
                    setValue={setValue}
                    types={types}
                />
            </FilterPanel>
        </div>
    );
};
