import React from "react";
import { useTranslation } from "react-i18next";

import { useFavouriteToggle } from "hooks/useFavouriteToggle";

import { FavouriteButton } from "components/ui/FavouriteButton";

import styles from "./ContentCard.module.scss";
import type { ContentCardFavouriteState } from "./ContentCard.types";

const HEART_ICON_SIZE = 18;

interface ContentCardFavouriteProps extends ContentCardFavouriteState {
    isRow: boolean;
}

// its own component so only a card that actually shows a heart subscribes to the favourite mutations
export const ContentCardFavourite: React.FC<ContentCardFavouriteProps> = ({
    isRow,
    target,
    id,
    isFavourite,
}) => {
    const { t } = useTranslation();
    const favourite = useFavouriteToggle(target, id, isFavourite);

    return (
        <FavouriteButton
            favourite={favourite}
            label={t("contentCard.favourite")}
            iconSize={HEART_ICON_SIZE}
            className={[
                styles["content-card__favourite"],
                isRow && styles["content-card__favourite--row"],
            ]
                .filter(Boolean)
                .join(" ")}
        />
    );
};
