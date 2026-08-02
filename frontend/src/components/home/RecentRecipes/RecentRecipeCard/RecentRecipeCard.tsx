import { Flame, Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { RECIPE_RATING } from "constants/ratings";
import { recipeDetailsPath } from "constants/routes";
import type { RecipeSearchResultItem } from "types/recipe";

import { DonburiMarkCompact } from "components/icons";

import { formatKcal, roundCalories } from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";

import styles from "./RecentRecipeCard.module.scss";

interface RecentRecipeCardProps {
    recipe: RecipeSearchResultItem;
}

const IMAGE_ICON_SIZE = 22;
const STAR_ICON_SIZE = 11;

export const RecentRecipeCard: React.FC<RecentRecipeCardProps> = ({
    recipe,
}) => {
    const { t } = useTranslation("home");
    const { hours, minutes } = splitCookingTime(recipe.cooking_time);
    const timeLabel =
        hours > 0
            ? t("recentRecipes.cookingTimeHoursMinutes", { hours, minutes })
            : t("recentRecipes.cookingTimeMinutesOnly", { minutes });

    return (
        <Link
            to={recipeDetailsPath(recipe.id)}
            className={styles["recent-recipe-card"]}
        >
            <div
                className={styles["recent-recipe-card__image"]}
                aria-hidden="true"
            >
                <DonburiMarkCompact
                    size={IMAGE_ICON_SIZE}
                    className={styles["recent-recipe-card__image-icon"]}
                />
            </div>
            <div className={styles["recent-recipe-card__body"]}>
                <div className={styles["recent-recipe-card__title"]}>
                    {recipe.title}
                </div>
                <div className={styles["recent-recipe-card__meta"]}>
                    <span>{timeLabel}</span>
                    {recipe.calories_per_portion !== null && (
                        <span
                            className={styles["recent-recipe-card__calories"]}
                        >
                            <Flame size={STAR_ICON_SIZE} aria-hidden="true" />
                            {t("recentRecipes.caloriesValue", {
                                count: formatKcal(
                                    roundCalories(recipe.calories_per_portion),
                                ),
                            })}
                        </span>
                    )}
                    <span
                        className={styles["recent-recipe-card__rating"]}
                        aria-hidden="true"
                    >
                        <Star size={STAR_ICON_SIZE} />
                        {RECIPE_RATING}
                    </span>
                </div>
            </div>
        </Link>
    );
};
