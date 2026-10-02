import React from "react";
import { useTranslation } from "react-i18next";

import type { FavouriteToggle } from "hooks/useFavouriteToggle";

import { HeroVisitorActions } from "components/ui/HeroVisitorActions";
import { OwnerActions } from "components/ui/OwnerActions";

interface MenuDetailsActionsProps {
    title: string;
    isOwner: boolean;
    favourite: FavouriteToggle;
    // null for a guest, whose actions are a sign-in prompt instead of a heart
    visitorFavourite: FavouriteToggle | null;
    editTo: string;
    onDelete: () => void;
    onLogIntake?: () => void;
    onCook?: () => void;
}

export const MenuDetailsActions: React.FC<MenuDetailsActionsProps> = ({
    title,
    isOwner,
    favourite,
    visitorFavourite,
    editTo,
    onDelete,
    onLogIntake,
    onCook,
}) => {
    const { t } = useTranslation("menu");
    const favouriteLabel = t("menuDetailsPage.favourite");
    const logIntakeLabel = t("menuDetailsPage.logIntake");
    const cookLabel = t("menuDetailsPage.cookedIt");

    if (isOwner) {
        return (
            <OwnerActions
                editTo={editTo}
                onDelete={onDelete}
                editLabel={t("menuDetailsPage.editButton")}
                deleteLabel={t("menuDetailsPage.deleteButton")}
                favourite={favourite}
                favouriteLabel={favouriteLabel}
                shareTitle={title}
                onLogIntake={onLogIntake}
                logIntakeLabel={logIntakeLabel}
                onCook={onCook}
                cookLabel={cookLabel}
            />
        );
    }

    return (
        <HeroVisitorActions
            favourite={visitorFavourite}
            favouriteLabel={favouriteLabel}
            shareTitle={title}
            guestCtaLabel={t("menuDetailsPage.guestCta")}
            logIntakeLabel={logIntakeLabel}
            onLogIntake={onLogIntake}
            cookLabel={cookLabel}
            onCook={onCook}
        />
    );
};
