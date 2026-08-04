import { Calendar, Clock, Flame } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { RECIPE_RATING, RECIPE_RATING_COUNT } from "constants/ratings";

import { RecipeRatingStars } from "components/recipes/RecipeRatingStars";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroStatsProps {
    formattedCookingTime: string;
    formattedCalories: string;
    totalCalories: string | null;
    formattedDate: string;
    isOwner: boolean;
    exceedsBudget?: boolean;
}

const STAT_ICON_SIZE = 16;
const SECONDARY_STAT_CLASS = `${styles["recipe-hero__stat"]} ${styles["recipe-hero__stat--secondary"]}`;

export const RecipeHeroStats: React.FC<RecipeHeroStatsProps> = ({
    formattedCookingTime,
    formattedCalories,
    totalCalories,
    formattedDate,
    isOwner,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("recipes");
    const caloriesStatClassName = [
        styles["recipe-hero__stat"],
        exceedsBudget && styles["recipe-hero__stat--calorie-over"],
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles["recipe-hero__stats"]}>
            <div className={styles["recipe-hero__stat"]}>
                <span className={styles["recipe-hero__stat-label"]}>
                    {t("recipeDetailsPage.cookingTime")}
                </span>
                <span className={styles["recipe-hero__stat-value"]}>
                    <Clock size={STAT_ICON_SIZE} aria-hidden="true" />
                    {formattedCookingTime}
                </span>
            </div>
            <div
                className={caloriesStatClassName}
                title={
                    exceedsBudget
                        ? t("common:contentCard.overBudgetTooltip")
                        : undefined
                }
            >
                <span className={styles["recipe-hero__stat-label"]}>
                    {t("recipeDetailsPage.calories")}
                </span>
                <span className={styles["recipe-hero__stat-value"]}>
                    <Flame size={STAT_ICON_SIZE} aria-hidden="true" />
                    {formattedCalories}
                </span>
                {totalCalories && (
                    <span className={styles["recipe-hero__stat-secondary"]}>
                        {totalCalories}
                    </span>
                )}
            </div>
            <div className={SECONDARY_STAT_CLASS}>
                <span className={styles["recipe-hero__stat-label"]}>
                    {t("recipeDetailsPage.creationDate")}
                </span>
                <span className={styles["recipe-hero__stat-value"]}>
                    <Calendar size={STAT_ICON_SIZE} aria-hidden="true" />
                    {formattedDate}
                </span>
            </div>
            {isOwner && (
                <div className={SECONDARY_STAT_CLASS}>
                    <span className={styles["recipe-hero__stat-label"]}>
                        {t("recipeDetailsPage.yourRating")}
                    </span>
                    <RecipeRatingStars
                        rating={RECIPE_RATING}
                        ratingCount={RECIPE_RATING_COUNT}
                    />
                </div>
            )}
        </div>
    );
};
