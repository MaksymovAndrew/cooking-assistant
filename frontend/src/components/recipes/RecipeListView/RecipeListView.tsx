import { Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { RecipeListItem } from "types/recipe";
import type { RecipeTypeSummary } from "types/recipeType";

import { RecipeCard } from "components/cards/RecipeCard";
import { AppShell } from "components/layout/AppShell";
import { RecipeActiveFilters } from "components/recipes/RecipeActiveFilters";
import type { RecipeFilterPanelProps } from "components/recipes/RecipeFilterPanel";
import { RecipeFilterPanel } from "components/recipes/RecipeFilterPanel";
import { RecipeTypeDescriptions } from "components/recipes/RecipeTypeDescriptions";
import { ErrorState } from "components/ui/ErrorState";
import { LinkButton } from "components/ui/LinkButton";
import { ListLoadMoreFooter } from "components/ui/LoadMore";

import { RecipeListEmptyState } from "./RecipeListEmptyState";
import styles from "./RecipeListView.module.scss";

interface RecipeListViewProps extends RecipeFilterPanelProps {
    recipes: RecipeListItem[];
    noRecipes: boolean;
    error: string | null;
    onRetry: () => void;
    descriptions: RecipeTypeSummary[];
    heading: string;
    subtitle: string;
    emptyTitle: string;
    emptyDescription: string;
    hasActiveFilters: boolean;
    clearFilters: () => void;
    mine?: boolean;
    currentUserId?: number | null;
    loadedCount: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    loadMoreError: string | null;
}

const NEW_RECIPE_ICON_SIZE = 18;

export const RecipeListView: React.FC<RecipeListViewProps> = ({
    filters,
    setSelectedTypes,
    setMinCookingTime,
    setMaxCookingTime,
    setSortOrder,
    types,
    recipes,
    noRecipes,
    error,
    onRetry,
    descriptions,
    heading,
    subtitle,
    emptyTitle,
    emptyDescription,
    hasActiveFilters,
    clearFilters,
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
                <div className={styles["recipe-list-view__header"]}>
                    <div>
                        <h1 className={styles["recipe-list-view__heading"]}>
                            {heading}
                        </h1>
                        <p className={styles["recipe-list-view__subtitle"]}>
                            {subtitle}
                        </p>
                    </div>
                    <LinkButton to={ROUTES.addRecipe}>
                        <Plus size={NEW_RECIPE_ICON_SIZE} aria-hidden="true" />
                        {t("recipes:recipeListView.newRecipe")}
                    </LinkButton>
                </div>
                <RecipeTypeDescriptions descriptions={descriptions} />
                <RecipeFilterPanel
                    filters={filters}
                    setSelectedTypes={setSelectedTypes}
                    setMinCookingTime={setMinCookingTime}
                    setMaxCookingTime={setMaxCookingTime}
                    setSortOrder={setSortOrder}
                    types={types}
                    searchPlaceholder={searchPlaceholder}
                    total={total}
                />
                <RecipeActiveFilters
                    total={total}
                    filters={filters}
                    setMinCookingTime={setMinCookingTime}
                    setMaxCookingTime={setMaxCookingTime}
                    setSortOrder={setSortOrder}
                    clearFilters={clearFilters}
                />
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
                        emptyTitle={emptyTitle}
                        emptyDescription={emptyDescription}
                        searchQuery={filters.ingredientName}
                        clearFilters={clearFilters}
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
