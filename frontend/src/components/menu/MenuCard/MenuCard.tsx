import React from "react";
import { useTranslation } from "react-i18next";

import { FAVOURITE_TARGET } from "constants/favourites";
import { menuDetailsPath } from "constants/routes";
import type { Menu } from "types/menu";

import type { ContentCardVariant } from "components/cards/ContentCard";
import {
    cardFavourite,
    cardRating,
    ContentCard,
} from "components/cards/ContentCard";
import { NotebookMark } from "components/icons";

import { mediaUrl } from "utils/mediaUrl";
import { menuCategoryName } from "utils/referenceLabels";

type MenuCardMenu = Pick<
    Menu,
    | "id"
    | "title"
    | "categoryname"
    | "recipe_count"
    | "isFavourite"
    | "photo_key"
    | "ratingAverage"
    | "ratingCount"
>;

interface MenuCardProps {
    menu: MenuCardMenu;
    mine?: boolean;
    variant?: ContentCardVariant;
}

export const MenuCard: React.FC<MenuCardProps> = ({
    menu,
    mine = false,
    variant,
}) => {
    const { t } = useTranslation("menu");

    return (
        <ContentCard
            href={menuDetailsPath(menu.id)}
            title={menu.title}
            imageIcon={NotebookMark}
            imageSrc={mediaUrl(menu.photo_key, "card")}
            chipLabel={menuCategoryName(t, menu.categoryname)}
            mine={mine}
            variant={variant}
            rating={cardRating(menu)}
            favourite={cardFavourite(FAVOURITE_TARGET.menu, menu)}
            metaText={t("menuCard.meta", {
                category: menuCategoryName(t, menu.categoryname),
                count: menu.recipe_count,
            })}
        />
    );
};
