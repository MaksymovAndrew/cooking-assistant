import { Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { recipeDetailsPath } from "constants/routes";
import type { RecipeListItem } from "types/recipe";

import { DonburiMarkCompact } from "components/icons";

import { splitCookingTime } from "utils/cookingTimeUtils";

import styles from "./RecentRecipeCard.module.scss";

interface RecentRecipeCardProps {
    recipe: RecipeListItem;
}

const IMAGE_ICON_SIZE = 22;
const STAR_ICON_SIZE = 11;
// no rating data exists on the backend yet - a fixed decorative value matches
// the design's rating figure without implying a real per-recipe review count
const PLACEHOLDER_RATING = "4.8";

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
                    <span
                        className={styles["recent-recipe-card__rating"]}
                        aria-hidden="true"
                    >
                        <Star size={STAR_ICON_SIZE} />
                        {PLACEHOLDER_RATING}
                    </span>
                </div>
            </div>
        </Link>
    );
};
