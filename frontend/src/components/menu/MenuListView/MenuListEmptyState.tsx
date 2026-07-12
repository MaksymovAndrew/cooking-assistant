import { Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { NotebookMark } from "components/icons";
import { Button } from "components/ui/Button";
import { EmptyState } from "components/ui/EmptyState";
import { LinkButton } from "components/ui/LinkButton";

const NEW_MENU_ICON_SIZE = 18;

interface MenuListEmptyStateProps {
    hasActiveFilters: boolean;
    emptyTitle: string;
    emptyDescription: string;
    searchQuery: string | null;
    clearFilters: () => void;
}

export const MenuListEmptyState: React.FC<MenuListEmptyStateProps> = ({
    hasActiveFilters,
    emptyTitle,
    emptyDescription,
    searchQuery,
    clearFilters,
}) => {
    const { t } = useTranslation("menu");
    const createFirstButton = (
        <LinkButton to={ROUTES.addMenu} size="lg">
            <Plus size={NEW_MENU_ICON_SIZE} aria-hidden="true" />
            {t("menuListView.createFirst")}
        </LinkButton>
    );

    if (!hasActiveFilters) {
        return (
            <EmptyState
                icon={NotebookMark}
                title={emptyTitle}
                description={emptyDescription}
                action={createFirstButton}
            />
        );
    }

    return (
        <EmptyState
            icon={NotebookMark}
            title={t("menuListView.noMatchesTitle")}
            description={
                searchQuery
                    ? t("menuListView.noMatchesWithQuery", {
                          query: searchQuery,
                      })
                    : t("menuListView.noMatchesWithoutQuery")
            }
            action={
                <>
                    {createFirstButton}
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={clearFilters}
                    >
                        {t("menuListView.clearFilters")}
                    </Button>
                </>
            }
        />
    );
};
