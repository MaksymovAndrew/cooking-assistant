import React from "react";
import { useTranslation } from "react-i18next";

import { FAVOURITE_TARGET } from "constants/favourites";
import { menuDetailsPath } from "constants/routes";

import type { ContentCardVariant } from "components/cards/ContentCard";
import { ContentCard } from "components/cards/ContentCard";
import { NotebookMark } from "components/icons";

import { mediaUrl } from "utils/mediaUrl";

interface MenuCardProps {
    id: number;
    title: string;
    categoryName: string;
    recipeCount: number;
    mine?: boolean;
    variant?: ContentCardVariant;
    // null or absent for an anonymous viewer, so the heart only appears where the server knows who is looking
    isFavourite?: boolean | null;
    photoKey?: string | null;
    // absent where a list doesn't carry the rating totals
    ratingAverage?: number | null;
    ratingCount?: number;
}

export const MenuCard: React.FC<MenuCardProps> = ({
    id,
    title,
    categoryName,
    recipeCount,
    mine = false,
    variant,
    isFavourite,
    photoKey,
    ratingAverage = null,
    ratingCount,
}) => {
    const { t } = useTranslation("menu");

    return (
        <ContentCard
            href={menuDetailsPath(id)}
            title={title}
            imageIcon={NotebookMark}
            imageSrc={mediaUrl(photoKey, "card")}
            chipLabel={categoryName}
            mine={mine}
            variant={variant}
            rating={
                typeof ratingCount === "number"
                    ? { average: ratingAverage, count: ratingCount }
                    : null
            }
            favourite={
                typeof isFavourite === "boolean"
                    ? { target: FAVOURITE_TARGET.menu, id, isFavourite }
                    : null
            }
            metaText={t("menuCard.meta", {
                category: categoryName,
                count: recipeCount,
            })}
        />
    );
};
