import React, { useState } from "react";

import type { RecipeFilterParams } from "types/recipe";
import type { RecipeTypeSummary } from "types/recipeType";

import type { ActiveFilterEntry } from "hooks/useListFilters";

import { AppShell } from "components/layout/AppShell";
import { RecipeActiveFilters } from "components/recipes/RecipeActiveFilters";
import type { RecipeFilterPanelProps } from "components/recipes/RecipeFilterPanel";
import { RecipeFilterPanel } from "components/recipes/RecipeFilterPanel";
import { RecipeTypeDescriptions } from "components/recipes/RecipeTypeDescriptions";

import { RecipeListHeader } from "./RecipeListHeader";
import type { RecipeListResultsProps } from "./RecipeListResults";
import { RecipeListResults } from "./RecipeListResults";
import styles from "./RecipeListView.module.scss";
import { RecipePantryBanner } from "./RecipePantryBanner";

interface RecipeListViewProps
    extends RecipeFilterPanelProps, RecipeListResultsProps {
    resetFilters: () => void;
    descriptions: RecipeTypeSummary[];
    heading: string;
    subtitle: string;
    activeFilters: ActiveFilterEntry<RecipeFilterParams>[];
}

export const RecipeListView: React.FC<RecipeListViewProps> = ({
    filters,
    setValue,
    setValues,
    resetFilters,
    activeCount,
    types,
    ingredients,
    isPantryEmpty,
    error,
    descriptions,
    heading,
    subtitle,
    hasActiveFilters,
    activeFilters,
    searchPlaceholder,
    total,
    ...results
}) => {
    // remount SearchField on reset, or a pending debounce re-applies the search just cleared
    const [searchResetKey, setSearchResetKey] = useState(0);

    const handleResetFilters = () => {
        resetFilters();
        setSearchResetKey((key) => key + 1);
    };

    return (
        <AppShell>
            <div className={styles["recipe-list-view"]}>
                <RecipeListHeader heading={heading} subtitle={subtitle} />
                <RecipeTypeDescriptions descriptions={descriptions} />
                <RecipeFilterPanel
                    filters={filters}
                    setValue={setValue}
                    setValues={setValues}
                    activeCount={activeCount}
                    types={types}
                    ingredients={ingredients}
                    searchPlaceholder={searchPlaceholder}
                    total={total}
                    searchResetKey={searchResetKey}
                />
                <RecipeActiveFilters
                    total={total}
                    activeFilters={activeFilters}
                    hasActiveFilters={hasActiveFilters}
                    resetFilters={handleResetFilters}
                />
                {filters.inPantry && !isPantryEmpty && !error && (
                    <RecipePantryBanner total={total} />
                )}
                <RecipeListResults
                    {...results}
                    isPantryEmpty={isPantryEmpty}
                    error={error}
                    hasActiveFilters={hasActiveFilters}
                    total={total}
                    searchQuery={filters.search || null}
                    clearFilters={handleResetFilters}
                />
            </div>
        </AppShell>
    );
};
