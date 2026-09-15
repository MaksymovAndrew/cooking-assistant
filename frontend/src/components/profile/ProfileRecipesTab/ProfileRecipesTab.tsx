import React from "react";
import { useTranslation } from "react-i18next";

import { MOBILE_MEDIA_QUERY } from "constants/breakpoints";
import type { RecipeSearchResultItem } from "types/recipe";

import { useMediaQuery } from "hooks/useMediaQuery";

import { RecipeCard } from "components/cards/RecipeCard";
import { UtensilsMark } from "components/icons";
import { EmptyState } from "components/ui/EmptyState";
import { ListLoadMoreFooter } from "components/ui/LoadMore";

import styles from "./ProfileRecipesTab.module.scss";

interface ProfileRecipesTabProps {
    recipes: RecipeSearchResultItem[];
    total: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    // the favourites list reuses this tab with its own empty-state wording
    emptyTitle?: string;
}

export const ProfileRecipesTab: React.FC<ProfileRecipesTabProps> = ({
    recipes,
    total,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    emptyTitle,
}) => {
    const { t } = useTranslation("profile");
    const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

    if (recipes.length === 0) {
        return (
            <EmptyState
                icon={UtensilsMark}
                title={emptyTitle ?? t("profilePage.noRecipes")}
            />
        );
    }

    return (
        <>
            <div className={styles["profile-recipes-tab__grid"]}>
                {recipes.map((recipe) => (
                    <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        mine={recipe.isOwner}
                        variant={isMobile ? "row" : "grid"}
                    />
                ))}
            </div>
            <ListLoadMoreFooter
                total={total}
                loadedCount={recipes.length}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                loadMoreError={null}
            />
        </>
    );
};
