import React from "react";

import type { RecipeListItem } from "types/recipe";
import type { RecipeTypeSummary } from "types/recipeType";

import { ListPageLayout } from "components/layout/ListPageLayout";
import { RecipeCard } from "components/recipes/RecipeCard";
import type { RecipeFilterPanelProps } from "components/recipes/RecipeFilterPanel";
import { RecipeFilterPanel } from "components/recipes/RecipeFilterPanel";
import { RecipeTypeDescriptions } from "components/recipes/RecipeTypeDescriptions";
import { ListLoadMoreFooter } from "components/ui/LoadMore";

interface RecipeListViewProps extends RecipeFilterPanelProps {
    recipes: RecipeListItem[];
    noRecipes: boolean;
    error: string | null;
    descriptions: RecipeTypeSummary[];
    heading: string;
    emptyMessage: string;
    actionSlot?: React.ReactNode;
    total: number;
    loadedCount: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    loadMoreError: string | null;
}

export const RecipeListView: React.FC<RecipeListViewProps> = ({
    filters,
    setSelectedTypes,
    setStartDate,
    setEndDate,
    setMinCookingTime,
    setMaxCookingTime,
    setSortOrder,
    types,
    recipes,
    noRecipes,
    error,
    descriptions,
    heading,
    emptyMessage,
    searchPlaceholder,
    actionSlot,
    total,
    loadedCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loadMoreError,
}) => (
    <ListPageLayout
        filterSlot={
            <RecipeFilterPanel
                filters={filters}
                setSelectedTypes={setSelectedTypes}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                setMinCookingTime={setMinCookingTime}
                setMaxCookingTime={setMaxCookingTime}
                setSortOrder={setSortOrder}
                types={types}
                searchPlaceholder={searchPlaceholder}
            />
        }
        actionSlot={actionSlot}
        heading={heading}
        afterHeading={<RecipeTypeDescriptions descriptions={descriptions} />}
        isEmpty={noRecipes}
        emptyMessage={emptyMessage}
        error={error}
        footerSlot={
            <ListLoadMoreFooter
                total={total}
                loadedCount={loadedCount}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                loadMoreError={loadMoreError}
            />
        }
    >
        {recipes.map((recipe) => (
            <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                typeName={recipe.type_name}
                creationDate={recipe.creation_date}
                cookingTime={recipe.cooking_time}
            />
        ))}
    </ListPageLayout>
);
