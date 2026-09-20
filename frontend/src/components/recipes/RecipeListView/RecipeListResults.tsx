import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeSearchResultItem } from "types/recipe";

import { ErrorState } from "components/ui/ErrorState";
import { ListLoadMoreFooter } from "components/ui/LoadMore";

import { RecipeListEmptyState } from "./RecipeListEmptyState";
import { RecipeListGrid } from "./RecipeListGrid";

export interface RecipeListResultsProps {
    recipes: RecipeSearchResultItem[];
    calorieGoal: number | null;
    calorieRemaining: number | null;
    noRecipes: boolean;
    isPantryEmpty: boolean;
    error: string | null;
    onRetry: () => void;
    emptyTitle: string;
    emptyDescription: string;
    hasActiveFilters: boolean;
    mine?: boolean;
    loadedCount: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    loadMoreError: string | null;
}

interface Props extends RecipeListResultsProps {
    total: number;
    searchQuery: string | null;
    clearFilters: () => void;
}

export const RecipeListResults: React.FC<Props> = ({
    recipes,
    calorieGoal,
    calorieRemaining,
    noRecipes,
    isPantryEmpty,
    error,
    onRetry,
    emptyTitle,
    emptyDescription,
    hasActiveFilters,
    mine = false,
    total,
    loadedCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loadMoreError,
    searchQuery,
    clearFilters,
}) => {
    const { t } = useTranslation();

    if (error) {
        return (
            <ErrorState
                title={t("errorState.title")}
                description={error}
                onRetry={onRetry}
                retryLabel={t("errorState.retry")}
            />
        );
    }

    if (noRecipes) {
        return (
            <RecipeListEmptyState
                hasActiveFilters={hasActiveFilters}
                isPantryEmpty={isPantryEmpty}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                searchQuery={searchQuery}
                clearFilters={clearFilters}
            />
        );
    }

    return (
        <>
            <RecipeListGrid
                recipes={recipes}
                calorieGoal={calorieGoal}
                calorieRemaining={calorieRemaining}
                mine={mine}
            />
            <ListLoadMoreFooter
                total={total}
                loadedCount={loadedCount}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                loadMoreError={loadMoreError}
            />
        </>
    );
};
