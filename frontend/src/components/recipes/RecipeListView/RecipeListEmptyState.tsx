import { Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { BasketMark, UtensilsMark } from "components/icons";
import { Button } from "components/ui/Button";
import { EmptyState } from "components/ui/EmptyState";
import { LinkButton } from "components/ui/LinkButton";

const NEW_RECIPE_ICON_SIZE = 18;

interface RecipeListEmptyStateProps {
    hasActiveFilters: boolean;
    isPantryEmpty: boolean;
    emptyTitle: string;
    emptyDescription: string;
    searchQuery: string | null;
    clearFilters: () => void;
}

export const RecipeListEmptyState: React.FC<RecipeListEmptyStateProps> = ({
    hasActiveFilters,
    isPantryEmpty,
    emptyTitle,
    emptyDescription,
    searchQuery,
    clearFilters,
}) => {
    const { t } = useTranslation("recipes");
    const createFirstButton = (
        <LinkButton to={ROUTES.addRecipe} size="lg">
            <Plus size={NEW_RECIPE_ICON_SIZE} aria-hidden="true" />
            {t("recipeListView.createFirst")}
        </LinkButton>
    );

    if (isPantryEmpty) {
        return (
            <EmptyState
                icon={BasketMark}
                title={t("filterPanel.pantryEmptyTitle")}
                description={t("filterPanel.pantryEmptyDescription")}
                action={
                    <LinkButton to={ROUTES.ingredients} size="lg">
                        {t("filterPanel.pantryEmptyAction")}
                    </LinkButton>
                }
            />
        );
    }

    if (!hasActiveFilters) {
        return (
            <EmptyState
                icon={UtensilsMark}
                title={emptyTitle}
                description={emptyDescription}
                action={createFirstButton}
            />
        );
    }

    return (
        <EmptyState
            icon={UtensilsMark}
            title={t("recipeListView.noMatchesTitle")}
            description={
                searchQuery
                    ? t("recipeListView.noMatchesWithQuery", {
                          query: searchQuery,
                      })
                    : t("recipeListView.noMatchesWithoutQuery")
            }
            action={
                <>
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={clearFilters}
                    >
                        {t("recipeListView.clearFilters")}
                    </Button>
                    {createFirstButton}
                </>
            }
        />
    );
};
