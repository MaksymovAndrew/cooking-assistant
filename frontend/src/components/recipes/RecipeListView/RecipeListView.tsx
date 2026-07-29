import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeFilterParams, RecipeListItem } from "types/recipe";
import type { RecipeTypeSummary } from "types/recipeType";

import type { ActiveFilterEntry } from "hooks/useListFilters";

import { RecipeCard } from "components/cards/RecipeCard";
import { AppShell } from "components/layout/AppShell";
import { RecipeActiveFilters } from "components/recipes/RecipeActiveFilters";
import type { RecipeFilterPanelProps } from "components/recipes/RecipeFilterPanel";
import { RecipeFilterPanel } from "components/recipes/RecipeFilterPanel";
import { RecipeTypeDescriptions } from "components/recipes/RecipeTypeDescriptions";
import { ErrorState } from "components/ui/ErrorState";
import { ListLoadMoreFooter } from "components/ui/LoadMore";

import { RecipeListEmptyState } from "./RecipeListEmptyState";
import { RecipeListHeader } from "./RecipeListHeader";
import styles from "./RecipeListView.module.scss";
import { RecipePantryBanner } from "./RecipePantryBanner";

interface RecipeListViewProps extends RecipeFilterPanelProps {
    recipes: RecipeListItem[];
    noRecipes: boolean;
    isPantryEmpty: boolean;
    error: string | null;
    onRetry: () => void;
    descriptions: RecipeTypeSummary[];
    heading: string;
    subtitle: string;
    emptyTitle: string;
    emptyDescription: string;
    hasActiveFilters: boolean;
    activeFilters: ActiveFilterEntry<RecipeFilterParams>[];
    mine?: boolean;
    currentUserId?: number | null;
    loadedCount: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    loadMoreError: string | null;
}

export const RecipeListView: React.FC<RecipeListViewProps> = ({
    filters,
    setValue,
    resetFilters,
    activeCount,
    types,
    recipes,
    noRecipes,
    isPantryEmpty,
    error,
    onRetry,
    descriptions,
    heading,
    subtitle,
    emptyTitle,
    emptyDescription,
    hasActiveFilters,
    activeFilters,
    mine = false,
    currentUserId = null,
    searchPlaceholder,
    total,
    loadedCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loadMoreError,
}) => {
    const { t } = useTranslation();

    return (
        <AppShell>
            <div className={styles["recipe-list-view"]}>
                <RecipeListHeader heading={heading} subtitle={subtitle} />
                <RecipeTypeDescriptions descriptions={descriptions} />
                <RecipeFilterPanel
                    filters={filters}
                    setValue={setValue}
                    resetFilters={resetFilters}
                    activeCount={activeCount}
                    types={types}
                    searchPlaceholder={searchPlaceholder}
                    total={total}
                />
                <RecipeActiveFilters
                    total={total}
                    activeFilters={activeFilters}
                    hasActiveFilters={hasActiveFilters}
                    resetFilters={resetFilters}
                />
                {filters.inPantry && !isPantryEmpty && !error && (
                    <RecipePantryBanner total={total} />
                )}
                {error && (
                    <ErrorState
                        title={t("errorState.title")}
                        description={error}
                        onRetry={onRetry}
                        retryLabel={t("errorState.retry")}
                    />
                )}
                {!error && noRecipes && (
                    <RecipeListEmptyState
                        hasActiveFilters={hasActiveFilters}
                        isPantryEmpty={isPantryEmpty}
                        emptyTitle={emptyTitle}
                        emptyDescription={emptyDescription}
                        searchQuery={filters.search || null}
                        clearFilters={resetFilters}
                    />
                )}
                {!error && !noRecipes && (
                    <div className={styles["recipe-list-view__grid"]}>
                        {recipes.map((recipe) => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                mine={
                                    mine ||
                                    (typeof recipe.person_id === "number" &&
                                        recipe.person_id === currentUserId)
                                }
                            />
                        ))}
                    </div>
                )}
                {!error && !noRecipes && (
                    <ListLoadMoreFooter
                        total={total}
                        loadedCount={loadedCount}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                        loadMoreError={loadMoreError}
                    />
                )}
            </div>
        </AppShell>
    );
};
