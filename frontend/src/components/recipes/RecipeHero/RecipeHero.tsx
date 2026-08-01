import { Calendar, Clock, Flame, Heart } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { RECIPE_RATING, RECIPE_RATING_COUNT } from "constants/ratings";
import type { RecipeDetails } from "types/recipe";

import { UtensilsMarkSimple } from "components/icons";
import { RecipeRatingStars } from "components/recipes/RecipeRatingStars";
import { Chip } from "components/ui/Chip";
import { OwnerActions } from "components/ui/OwnerActions";

import { roundCalories, scaleCaloriesForPortions } from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";
import { formatFullDate } from "utils/dateUtils";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroProps {
    recipe: RecipeDetails;
    portionCount: number;
    editTo: string;
    onDelete: () => void;
}

const IMAGE_ICON_SIZE = 56;
const FAVOURITE_ICON_SIZE = 20;
const STAT_ICON_SIZE = 16;
const SECONDARY_STAT_CLASS = `${styles["recipe-hero__stat"]} ${styles["recipe-hero__stat--secondary"]}`;

export const RecipeHero: React.FC<RecipeHeroProps> = ({
    recipe,
    portionCount,
    editTo,
    onDelete,
}) => {
    const { t } = useTranslation("recipes");
    const favouriteLabel = t("recipeDetailsPage.favourite");
    const { hours, minutes } = splitCookingTime(recipe.cooking_time);
    const formattedCookingTime =
        hours > 0
            ? t("recipeDetailsPage.cookingTimeHoursMinutes", {
                  hours,
                  minutes,
              })
            : t("recipeDetailsPage.cookingTimeMinutes", { minutes });
    const formattedDate = formatFullDate(recipe.creation_date);
    const formattedCalories =
        recipe.calories_per_portion === null
            ? t("recipeDetailsPage.caloriesUnavailable")
            : t("recipeDetailsPage.caloriesPerPortion", {
                  count: roundCalories(recipe.calories_per_portion),
              });
    const totalCalories =
        recipe.calories_per_portion === null || portionCount === 1
            ? null
            : t("recipeDetailsPage.caloriesTotal", {
                  count: scaleCaloriesForPortions(
                      recipe.calories_per_portion,
                      portionCount,
                  ),
              });

    return (
        <div className={styles["recipe-hero"]}>
            <div className={styles["recipe-hero__image"]}>
                <UtensilsMarkSimple
                    size={IMAGE_ICON_SIZE}
                    className={styles["recipe-hero__image-icon"]}
                />
                <button
                    type="button"
                    disabled
                    aria-label={favouriteLabel}
                    className={styles["recipe-hero__favourite"]}
                >
                    <Heart size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                </button>
            </div>

            <Chip variant="type" className={styles["recipe-hero__chip"]}>
                {recipe.type_name}
            </Chip>
            <h1 className={styles["recipe-hero__title"]}>{recipe.title}</h1>

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
                <div className={styles["recipe-hero__stat"]}>
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
                {recipe.isOwner && (
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

            {recipe.isOwner ? (
                <div className={styles["recipe-hero__actions"]}>
                    <OwnerActions
                        editTo={editTo}
                        onDelete={onDelete}
                        editLabel={t("recipeDetailsPage.editButton")}
                        deleteLabel={t("recipeDetailsPage.deleteButton")}
                        favouriteLabel={favouriteLabel}
                    />
                </div>
            ) : (
                <div className={styles["recipe-hero__visitor-banner"]}>
                    <button
                        type="button"
                        disabled
                        aria-label={favouriteLabel}
                        className={styles["recipe-hero__visitor-favourite"]}
                    >
                        <Heart size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                        {favouriteLabel}
                    </button>
                    <span>{t("recipeDetailsPage.visitorBanner")}</span>
                </div>
            )}
        </div>
    );
};
