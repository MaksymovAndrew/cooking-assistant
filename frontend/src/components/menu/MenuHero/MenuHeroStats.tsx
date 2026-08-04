import { Clock, Flame } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { MENU_RATING, MENU_RATING_COUNT } from "constants/ratings";

import { BookMark } from "components/icons";
import { RecipeRatingStars } from "components/recipes/RecipeRatingStars";

import styles from "./MenuHero.module.scss";

interface MenuHeroStatsProps {
    formattedTotalTime: string;
    recipeCount: number;
    formattedCalories: string | null;
    isOwner: boolean;
    exceedsBudget?: boolean;
}

const STAT_ICON_SIZE = 16;

export const MenuHeroStats: React.FC<MenuHeroStatsProps> = ({
    formattedTotalTime,
    recipeCount,
    formattedCalories,
    isOwner,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("menu");
    const caloriesOverTooltip = exceedsBudget
        ? t("common:contentCard.overBudgetTooltip")
        : undefined;
    const caloriesStatClassName = [
        styles["menu-hero__stat"],
        exceedsBudget && styles["menu-hero__stat--calorie-over"],
    ]
        .filter(Boolean)
        .join(" ");
    const caloriesMobileClassName = [
        styles["menu-hero__mobile-meta-item"],
        exceedsBudget && styles["menu-hero__mobile-meta-item--calorie-over"],
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <>
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
                {isOwner && (
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
                {formattedCalories !== null && (
                    <div
                        className={caloriesStatClassName}
                        title={caloriesOverTooltip}
                    >
                        <span className={styles["menu-hero__stat-label"]}>
                            {t("menuDetailsPage.calories")}
                        </span>
                        <span className={styles["menu-hero__stat-value"]}>
                            <Flame size={STAT_ICON_SIZE} aria-hidden="true" />
                            {formattedCalories}
                        </span>
                    </div>
                )}
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
                {formattedCalories !== null && (
                    <span
                        className={caloriesMobileClassName}
                        title={caloriesOverTooltip}
                    >
                        <Flame size={STAT_ICON_SIZE} aria-hidden="true" />
                        {formattedCalories}
                    </span>
                )}
            </div>
        </>
    );
};
