import { Clock, Heart, Star, UtensilsCrossed } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuDetails } from "types/menu";

import { Chip } from "components/ui/Chip";
import { OwnerActions } from "components/ui/OwnerActions";

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
// no rating data exists on the backend yet - a fixed decorative value matches the
// design's rating stat without implying a real per-menu review count
const PLACEHOLDER_RATING = "4.8";

export const MenuHero: React.FC<MenuHeroProps> = ({
    menu,
    totalCookingTime,
    recipeCount,
    editTo,
    onDelete,
}) => {
    const { t } = useTranslation("menu");
    const { hours, minutes } = splitCookingTime(totalCookingTime);
    const formattedTotalTime =
        hours > 0
            ? t("menuDetailsPage.totalTimeHoursMinutes", { hours, minutes })
            : t("menuDetailsPage.totalTimeMinutes", { minutes });

    return (
        <div className={styles["menu-hero"]}>
            <div className={styles["menu-hero__title-row"]}>
                <h1 className={styles["menu-hero__title"]}>{menu.title}</h1>
                <Chip variant="type">{menu.categoryname}</Chip>
            </div>
            {menu.menucontent && (
                <p className={styles["menu-hero__description"]}>
                    {menu.menucontent}
                </p>
            )}

            {menu.isOwner ? (
                <div className={styles["menu-hero__actions"]}>
                    <OwnerActions
                        editTo={editTo}
                        onDelete={onDelete}
                        editLabel={t("menuDetailsPage.editButton")}
                        deleteLabel={t("menuDetailsPage.deleteButton")}
                    />
                </div>
            ) : (
                <div className={styles["menu-hero__visitor-banner"]}>
                    <button
                        type="button"
                        disabled
                        aria-label={t("menuDetailsPage.favourite")}
                        className={styles["menu-hero__favourite"]}
                    >
                        <Heart size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                        {t("menuDetailsPage.favourite")}
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
                <div className={styles["menu-hero__stat"]}>
                    <span className={styles["menu-hero__stat-label"]}>
                        {t("menuDetailsPage.rating")}
                    </span>
                    <span className={styles["menu-hero__stat-value"]}>
                        <Star size={STAT_ICON_SIZE} aria-hidden="true" />
                        {PLACEHOLDER_RATING}
                    </span>
                </div>
                <div className={styles["menu-hero__stat"]}>
                    <span className={styles["menu-hero__stat-label"]}>
                        {t("menuDetailsPage.recipes")}
                    </span>
                    <span className={styles["menu-hero__stat-value"]}>
                        <UtensilsCrossed
                            size={STAT_ICON_SIZE}
                            aria-hidden="true"
                        />
                        {recipeCount}
                    </span>
                </div>
            </div>
        </div>
    );
};
