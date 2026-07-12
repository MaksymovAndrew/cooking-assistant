import React from "react";
import { useTranslation } from "react-i18next";

import { MENU_RATING, MENU_RATING_COUNT } from "constants/ratings";
import { menuDetailsPath } from "constants/routes";

import type { ContentCardVariant } from "components/cards/ContentCard";
import { ContentCard } from "components/cards/ContentCard";
import { NotebookMark } from "components/icons";

interface MenuCardProps {
    id: number;
    title: string;
    categoryName: string;
    recipeCount: number;
    mine?: boolean;
    variant?: ContentCardVariant;
}

export const MenuCard: React.FC<MenuCardProps> = ({
    id,
    title,
    categoryName,
    recipeCount,
    mine = false,
    variant,
}) => {
    const { t } = useTranslation("menu");

    return (
        <ContentCard
            to={menuDetailsPath(id)}
            title={title}
            imageIcon={NotebookMark}
            chipLabel={categoryName}
            mine={mine}
            variant={variant}
            rating={MENU_RATING}
            ratingCount={MENU_RATING_COUNT}
            showFavourite={false}
            metaText={t("menuCard.meta", {
                category: categoryName,
                count: recipeCount,
            })}
        />
    );
};
