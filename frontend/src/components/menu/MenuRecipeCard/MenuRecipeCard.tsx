import { Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { RECIPE_RATING } from "constants/ratings";
import { recipeDetailsPath } from "constants/routes";

import { UtensilsMark } from "components/icons";
import { Link } from "components/ui/Link";
import { RecordPhoto } from "components/ui/RecordPhoto";

import { formatKcal, roundCalories } from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";
import { mediaUrl } from "utils/mediaUrl";

import styles from "./MenuRecipeCard.module.scss";

interface MenuRecipeCardRecipe {
    id: number;
    title: string;
    type_name: string;
    cooking_time: number;
    calories_per_portion: number | null;
    photo_key: string | null;
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
                  count: formatKcal(roundCalories(recipe.calories_per_portion)),
              });

    return (
        <Link
            href={recipeDetailsPath(recipe.id)}
            className={styles["menu-recipe-card"]}
        >
            <span className={styles["menu-recipe-card__image"]}>
                <RecordPhoto
                    src={mediaUrl(recipe.photo_key, "card")}
                    fallback={
                        <UtensilsMark
                            size={IMAGE_ICON_SIZE}
                            className={styles["menu-recipe-card__image-icon"]}
                        />
                    }
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
