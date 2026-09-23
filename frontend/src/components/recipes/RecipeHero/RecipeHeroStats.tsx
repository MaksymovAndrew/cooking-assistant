import { Calendar, Clock, Flame } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecordRating } from "types/rating";

import { RatingStars } from "components/ui/RatingStars";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroStatsProps {
    formattedCookingTime: string;
    formattedCalories: string;
    totalCalories: string | null;
    formattedDate: string;
    rating: RecordRating;
    exceedsBudget?: boolean;
}

const STAT_ICON_SIZE = 16;
const SECONDARY_STAT_CLASS = `${styles["recipe-hero__stat"]} ${styles["recipe-hero__stat--secondary"]}`;

export const RecipeHeroStats: React.FC<RecipeHeroStatsProps> = ({
    formattedCookingTime,
    formattedCalories,
    totalCalories,
    formattedDate,
    rating,
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
            <div className={SECONDARY_STAT_CLASS}>
                <span className={styles["recipe-hero__stat-label"]}>
                    {t("recipeDetailsPage.rating")}
                </span>
                <RatingStars
                    average={rating.ratingAverage}
                    count={rating.ratingCount}
                />
            </div>
        </div>
    );
};
