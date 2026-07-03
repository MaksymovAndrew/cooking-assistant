import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeTypeSummary } from "types/recipeType";

import type { RecipeFilterState } from "hooks/useRecipeListView";

import { CookingTimeInput } from "components/recipes/CookingTimeInput";
import { RecipeTypeFilter } from "components/recipes/RecipeTypeFilter";
import { DateFilterDropdown } from "components/ui/DateFilterDropdown";
import { SearchComponent } from "components/ui/SearchComponent";

export interface RecipeFilterPanelProps {
    filters: RecipeFilterState;
    setSelectedTypes: (types: number[]) => void;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    setMinCookingTime: (time: string) => void;
    setMaxCookingTime: (time: string) => void;
    setSortOrder: (order: string) => void;
    types: RecipeTypeSummary[];
    searchPlaceholder: string;
}

export const RecipeFilterPanel: React.FC<RecipeFilterPanelProps> = ({
    filters,
    setSelectedTypes,
    setStartDate,
    setEndDate,
    setMinCookingTime,
    setMaxCookingTime,
    setSortOrder,
    types,
    searchPlaceholder,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <SearchComponent placeholder={searchPlaceholder} />
                <div className="ml-4 mt-4 sm:mt-0">
                    <RecipeTypeFilter
                        selectedTypes={filters.selectedTypes}
                        onChange={setSelectedTypes}
                        types={types}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <DateFilterDropdown
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />

                <CookingTimeInput
                    id="minCookingTime"
                    label={t("mainPage.minCookingTime")}
                    value={filters.minCookingTime}
                    onChange={setMinCookingTime}
                    placeholder={t("mainPage.minPlaceholder")}
                    min="0"
                />

                <CookingTimeInput
                    id="maxCookingTime"
                    label={t("mainPage.maxCookingTime")}
                    value={filters.maxCookingTime}
                    onChange={setMaxCookingTime}
                    placeholder={t("mainPage.maxPlaceholder")}
                    min="1"
                />

                <div className="flex items-center mb-2 sm:mb-0">
                    <label htmlFor="sortOrder" className="mr-2">
                        {t("mainPage.sortByTime")}
                    </label>
                    <select
                        id="sortOrder"
                        value={filters.sortOrder}
                        onChange={(e) => {
                            setSortOrder(e.target.value);
                        }}
                        className="border rounded p-2"
                    >
                        <option value="asc">{t("mainPage.fastToSlow")}</option>
                        <option value="desc">{t("mainPage.slowToFast")}</option>
                    </select>
                </div>
            </div>
        </>
    );
};
