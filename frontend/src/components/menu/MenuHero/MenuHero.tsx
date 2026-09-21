import React from "react";
import { useTranslation } from "react-i18next";

import { RATING_TARGET } from "constants/ratings";
import type { MenuDetails } from "types/menu";

import { useRatingControl } from "hooks/useRatingControl";

import { MenuHeroStats } from "components/menu/MenuHero/MenuHeroStats";
import { AuthorByline } from "components/ui/AuthorByline";
import { Chip } from "components/ui/Chip";
import { RatingSummary } from "components/ui/RatingSummary";
import { StarRatingInput } from "components/ui/StarRatingInput";

import { formatKcal } from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";
import { mediaUrl } from "utils/mediaUrl";

import styles from "./MenuHero.module.scss";

interface MenuHeroProps {
    menu: MenuDetails["menu"];
    totalCookingTime: number;
    recipeCount: number;
    caloriesPerPortion: number | null;
    exceedsBudget?: boolean;
}

const RATING_ICON_SIZE = 13;

// title, meta and description only - actions and the ingredients/recipes grid live in
// MenuDetailsSecondary, which follows this in the page's single title -> meta -> description ->
// ingredients -> actions -> recipes reading order
export const MenuHero: React.FC<MenuHeroProps> = ({
    menu,
    totalCookingTime,
    recipeCount,
    caloriesPerPortion,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("menu");
    const { hours, minutes } = splitCookingTime(totalCookingTime);
    const formattedTotalTime =
        hours > 0
            ? t("menuDetailsPage.totalTimeHoursMinutes", { hours, minutes })
            : t("menuDetailsPage.totalTimeMinutes", { minutes });
    const formattedCalories =
        caloriesPerPortion === null
            ? null
            : t("menuDetailsPage.caloriesValue", {
                  count: formatKcal(Math.round(caloriesPerPortion)),
              });

    const coverSrc = mediaUrl(menu.photo_key, "hero");
    const rating = useRatingControl(RATING_TARGET.menu, menu.id, menu);
    // a signed-in viewer rates anyone's menu but their own; isFavourite is null only for a guest
    const canRate = menu.isFavourite !== null && !menu.isOwner;

    return (
        <div className={styles["menu-hero"]}>
            {coverSrc && (
                <img
                    className={styles["menu-hero__cover"]}
                    src={coverSrc}
                    alt={menu.title}
                    fetchPriority="high"
                />
            )}
            <div className={styles["menu-hero__header"]}>
                <div className={styles["menu-hero__title-row"]}>
                    <h1 className={styles["menu-hero__title"]}>{menu.title}</h1>
                    <Chip variant="type">{menu.categoryname}</Chip>
                    <RatingSummary
                        average={rating.ratingAverage}
                        count={rating.ratingCount}
                        iconSize={RATING_ICON_SIZE}
                        className={styles["menu-hero__rating-inline"]}
                    />
                </div>
                <AuthorByline
                    author={menu.author}
                    className={styles["menu-hero__author"]}
                />
            </div>

            <MenuHeroStats
                formattedTotalTime={formattedTotalTime}
                recipeCount={recipeCount}
                formattedCalories={formattedCalories}
                rating={rating}
                exceedsBudget={exceedsBudget}
            />

            {canRate && (
                <StarRatingInput
                    rating={rating}
                    label={t("common:rating.yourRating")}
                    className={styles["menu-hero__rate"]}
                />
            )}

            {menu.menucontent && (
                <p className={styles["menu-hero__description"]}>
                    {menu.menucontent}
                </p>
            )}
        </div>
    );
};
