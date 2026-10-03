import React from "react";
import { useTranslation } from "react-i18next";

import { RATING_TARGET } from "constants/ratings";
import type { MenuDetails } from "types/menu";

import { useLocale } from "hooks/useLocale";
import { useRatingControl } from "hooks/useRatingControl";

import { MenuHeroStats } from "components/menu/MenuHero/MenuHeroStats";
import { AuthorByline } from "components/ui/AuthorByline";
import { Chip } from "components/ui/Chip";
import { LanguageBadge } from "components/ui/LanguageBadge";
import { RatingSummary } from "components/ui/RatingSummary";
import { StarRatingInput } from "components/ui/StarRatingInput";

import { formatKcal } from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";
import { formatFullDate } from "utils/dateUtils";
import { mediaSrcSet, mediaUrl } from "utils/mediaUrl";
import { menuCategoryName } from "utils/referenceLabels";

import styles from "./MenuHero.module.scss";

interface MenuHeroProps {
    menu: MenuDetails["menu"];
    totalCookingTime: number;
    recipeCount: number;
    caloriesPerPortion: number | null;
    exceedsBudget?: boolean;
}

const RATING_ICON_SIZE = 13;
// 16:9, full page width up to 1280px less its gutters
const COVER_WIDTH = 1200;
const COVER_HEIGHT = 675;
const COVER_SIZES = "(min-width: 1280px) 1248px, 100vw";

export const MenuHero: React.FC<MenuHeroProps> = ({
    menu,
    totalCookingTime,
    recipeCount,
    caloriesPerPortion,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("menu");
    const locale = useLocale();
    const { hours, minutes } = splitCookingTime(totalCookingTime);
    const formattedTotalTime =
        hours > 0
            ? t("menuDetailsPage.totalTimeHoursMinutes", { hours, minutes })
            : t("menuDetailsPage.totalTimeMinutes", { minutes });
    const formattedCalories =
        caloriesPerPortion === null
            ? null
            : t("menuDetailsPage.caloriesValue", {
                  count: formatKcal(Math.round(caloriesPerPortion), locale),
              });

    const coverSrc = mediaUrl(menu.photo_key, "hero");
    const rating = useRatingControl(RATING_TARGET.menu, menu.id, menu);
    // isFavourite is null only for a guest
    const canRate = menu.isFavourite !== null && !menu.isOwner;

    return (
        <div className={styles["menu-hero"]}>
            {coverSrc && (
                <img
                    className={styles["menu-hero__cover"]}
                    src={coverSrc}
                    srcSet={mediaSrcSet(menu.photo_key) ?? undefined}
                    sizes={COVER_SIZES}
                    width={COVER_WIDTH}
                    height={COVER_HEIGHT}
                    alt={menu.title}
                    fetchPriority="high"
                />
            )}
            <div className={styles["menu-hero__header"]}>
                <div className={styles["menu-hero__title-row"]}>
                    <h1
                        className={styles["menu-hero__title"]}
                        lang={menu.language}
                    >
                        {menu.title}
                    </h1>
                    {menu.categoryName !== null && (
                        <Chip variant="type">
                            {menuCategoryName(t, menu.categoryName)}
                        </Chip>
                    )}
                    <LanguageBadge language={menu.language} />
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
                formattedDate={formatFullDate(menu.creation_date, locale)}
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

            {menu.menuContent && (
                <p
                    className={styles["menu-hero__description"]}
                    lang={menu.language}
                >
                    {menu.menuContent}
                </p>
            )}
        </div>
    );
};
