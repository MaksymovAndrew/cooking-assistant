import { Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { UtensilsMark } from "components/icons";
import { Button } from "components/ui/Button";
import { EmptyState } from "components/ui/EmptyState";
import { LinkButton } from "components/ui/LinkButton";

const NEW_RECIPE_ICON_SIZE = 18;

interface RecipeListEmptyStateProps {
    hasActiveFilters: boolean;
    emptyTitle: string;
    emptyDescription: string;
    searchQuery: string | null;
    clearFilters: () => void;
}

export const RecipeListEmptyState: React.FC<RecipeListEmptyStateProps> = ({
    hasActiveFilters,
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
                    {createFirstButton}
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={clearFilters}
                    >
                        {t("recipeListView.clearFilters")}
                    </Button>
                </>
            }
        />
    );
};
