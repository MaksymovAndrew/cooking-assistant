import React from "react";
import { useTranslation } from "react-i18next";

import type { FavouriteToggle } from "hooks/useFavouriteToggle";

import { HeroVisitorActions } from "components/ui/HeroVisitorActions";
import { OwnerActions } from "components/ui/OwnerActions";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroActionsProps {
    isOwner: boolean;
    favourite: FavouriteToggle;
    // null for a guest, whose actions are a sign-in prompt instead of a heart
    visitorFavourite: FavouriteToggle | null;
    favouriteLabel: string;
    shareTitle: string;
    editTo: string;
    onDelete: () => void;
    onLogIntake?: () => void;
}

export const RecipeHeroActions: React.FC<RecipeHeroActionsProps> = ({
    isOwner,
    favourite,
    visitorFavourite,
    favouriteLabel,
    shareTitle,
    editTo,
    onDelete,
    onLogIntake,
}) => {
    const { t } = useTranslation("recipes");

    if (isOwner) {
        return (
            <div className={styles["recipe-hero__actions"]}>
                <OwnerActions
                    editTo={editTo}
                    onDelete={onDelete}
                    editLabel={t("recipeDetailsPage.editButton")}
                    deleteLabel={t("recipeDetailsPage.deleteButton")}
                    favourite={favourite}
                    favouriteLabel={favouriteLabel}
                    shareTitle={shareTitle}
                    onLogIntake={onLogIntake}
                    logIntakeLabel={t("recipeDetailsPage.logIntake")}
                />
            </div>
        );
    }

    return (
        <div className={styles["recipe-hero__visitor-actions-wrap"]}>
            <HeroVisitorActions
                favourite={visitorFavourite}
                favouriteLabel={favouriteLabel}
                shareTitle={shareTitle}
                guestCtaLabel={t("recipeDetailsPage.guestCta")}
                logIntakeLabel={t("recipeDetailsPage.logIntake")}
                onLogIntake={onLogIntake}
            />
        </div>
    );
};
