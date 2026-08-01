import { Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { RECIPE_RATING } from "constants/ratings";
import { recipeDetailsPath } from "constants/routes";

import { UtensilsMark } from "components/icons";

import { roundCalories } from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";

import styles from "./MenuRecipeCard.module.scss";

interface MenuRecipeCardRecipe {
    id: number;
    title: string;
    type_name: string;
    cooking_time: number;
    calories_per_portion: number | null;
}

interface MenuRecipeCardProps {
    recipe: MenuRecipeCardRecipe;
}

const IMAGE_ICON_SIZE = 28;
const RATING_ICON_SIZE = 11;

export const MenuRecipeCard: React.FC<MenuRecipeCardProps> = ({ recipe }) => {
    const { t } = useTranslation("menu");
    const { hours, minutes } = splitCookingTime(recipe.cooking_time);
    const formattedTime =
        hours > 0
            ? t("menuDetailsPage.totalTimeHoursMinutes", { hours, minutes })
            : t("menuDetailsPage.totalTimeMinutes", { minutes });
    const formattedCalories =
        recipe.calories_per_portion === null
            ? null
            : t("menuDetailsPage.caloriesValue", {
                  count: roundCalories(recipe.calories_per_portion),
              });

    return (
        <Link
            to={recipeDetailsPath(recipe.id)}
            className={styles["menu-recipe-card"]}
        >
            <span className={styles["menu-recipe-card__image"]}>
                <UtensilsMark
                    size={IMAGE_ICON_SIZE}
                    className={styles["menu-recipe-card__image-icon"]}
                />
            </span>
            <span className={styles["menu-recipe-card__body"]}>
                <span className={styles["menu-recipe-card__title"]}>
                    {recipe.title}
                </span>
                <span className={styles["menu-recipe-card__meta-row"]}>
                    <span className={styles["menu-recipe-card__meta"]}>
                        {recipe.type_name} · {formattedTime}
                        {formattedCalories && ` · ${formattedCalories}`}
                    </span>
                    <span className={styles["menu-recipe-card__rating"]}>
                        <Star size={RATING_ICON_SIZE} aria-hidden="true" />
                        {RECIPE_RATING}
                    </span>
                </span>
            </span>
        </Link>
    );
};
