import { Clock, Heart, Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { MENU_RATING, MENU_RATING_COUNT } from "constants/ratings";
import type { MenuDetails } from "types/menu";

import { BookMark } from "components/icons";
import { MenuHeroActions } from "components/menu/MenuHeroActions";
import { RecipeRatingStars } from "components/recipes/RecipeRatingStars";
import { Chip } from "components/ui/Chip";

import { splitCookingTime } from "utils/cookingTimeUtils";

import styles from "./MenuHero.module.scss";

interface MenuHeroProps {
    menu: MenuDetails["menu"];
    totalCookingTime: number;
    recipeCount: number;
    editTo: string;
    onDelete: () => void;
}

const FAVOURITE_ICON_SIZE = 17;
const STAT_ICON_SIZE = 16;
const RATING_ICON_SIZE = 13;

export const MenuHero: React.FC<MenuHeroProps> = ({
    menu,
    totalCookingTime,
    recipeCount,
    editTo,
    onDelete,
}) => {
    const { t } = useTranslation("menu");
    const favouriteLabel = t("menuDetailsPage.favourite");
    const { hours, minutes } = splitCookingTime(totalCookingTime);
    const formattedTotalTime =
        hours > 0
            ? t("menuDetailsPage.totalTimeHoursMinutes", { hours, minutes })
            : t("menuDetailsPage.totalTimeMinutes", { minutes });

    return (
        <div className={styles["menu-hero"]}>
            <div className={styles["menu-hero__header"]}>
                <div className={styles["menu-hero__title-row"]}>
                    <h1 className={styles["menu-hero__title"]}>{menu.title}</h1>
                    <Chip variant="type">{menu.categoryname}</Chip>
                    <span className={styles["menu-hero__rating-inline"]}>
                        <Star
                            size={RATING_ICON_SIZE}
                            aria-hidden="true"
                            className={styles["menu-hero__rating-inline-icon"]}
                        />
                        {MENU_RATING}
                        <span className={styles["menu-hero__stat-count"]}>
                            {MENU_RATING_COUNT}
                        </span>
                    </span>
                </div>
                {menu.isOwner && (
                    <MenuHeroActions
                        editTo={editTo}
                        onDelete={onDelete}
                        editLabel={t("menuDetailsPage.editButton")}
                        deleteLabel={t("menuDetailsPage.deleteButton")}
                        favouriteLabel={favouriteLabel}
                    />
                )}
            </div>

            {menu.menucontent && (
                <p className={styles["menu-hero__description"]}>
                    {menu.menucontent}
                </p>
            )}

            {!menu.isOwner && (
                <div className={styles["menu-hero__visitor-banner"]}>
                    <button
                        type="button"
                        disabled
                        aria-label={favouriteLabel}
                        className={styles["menu-hero__favourite"]}
                    >
                        <Heart size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                        {favouriteLabel}
                    </button>
                    <span>{t("menuDetailsPage.visitorBanner")}</span>
                </div>
            )}

            <div className={styles["menu-hero__stats"]}>
                <div className={styles["menu-hero__stat"]}>
                    <span className={styles["menu-hero__stat-label"]}>
                        {t("menuDetailsPage.totalTime")}
                    </span>
                    <span className={styles["menu-hero__stat-value"]}>
                        <Clock size={STAT_ICON_SIZE} aria-hidden="true" />
                        {formattedTotalTime}
                    </span>
                </div>
                {menu.isOwner && (
                    <div
                        className={[
                            styles["menu-hero__stat"],
                            styles["menu-hero__stat--secondary"],
                        ].join(" ")}
                    >
                        <span className={styles["menu-hero__stat-label"]}>
                            {t("menuDetailsPage.yourRating")}
                        </span>
                        <RecipeRatingStars
                            rating={MENU_RATING}
                            ratingCount={MENU_RATING_COUNT}
                        />
                    </div>
                )}
                <div className={styles["menu-hero__stat"]}>
                    <span className={styles["menu-hero__stat-label"]}>
                        {t("menuDetailsPage.recipes")}
                    </span>
                    <span className={styles["menu-hero__stat-value"]}>
                        <BookMark size={STAT_ICON_SIZE} />
                        {recipeCount}
                    </span>
                </div>
            </div>

            <div className={styles["menu-hero__mobile-meta"]}>
                <span className={styles["menu-hero__mobile-meta-item"]}>
                    <Clock size={STAT_ICON_SIZE} aria-hidden="true" />
                    {formattedTotalTime}
                </span>
                <span className={styles["menu-hero__mobile-meta-item"]}>
                    <BookMark size={STAT_ICON_SIZE} />
                    {t("menuDetailsPage.recipesCaption", {
                        count: recipeCount,
                    })}
                </span>
            </div>
        </div>
    );
};
