import { Flame, Heart } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeDetails } from "types/recipe";

import { UtensilsMarkSimple } from "components/icons";
import { RecipeHeroStats } from "components/recipes/RecipeHero/RecipeHeroStats";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";
import { OwnerActions } from "components/ui/OwnerActions";

import {
    formatKcal,
    roundCalories,
    scaleCaloriesForPortions,
} from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";
import { formatFullDate } from "utils/dateUtils";

import styles from "./RecipeHero.module.scss";

interface RecipeHeroProps {
    recipe: RecipeDetails;
    portionCount: number;
    editTo: string;
    onDelete: () => void;
    onLogIntake?: () => void;
}

const IMAGE_ICON_SIZE = 56;
const FAVOURITE_ICON_SIZE = 20;

export const RecipeHero: React.FC<RecipeHeroProps> = ({
    recipe,
    portionCount,
    editTo,
    onDelete,
    onLogIntake,
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
                  count: formatKcal(roundCalories(recipe.calories_per_portion)),
              });
    const totalCalories =
        recipe.calories_per_portion === null || portionCount === 1
            ? null
            : t("recipeDetailsPage.caloriesTotal", {
                  count: formatKcal(
                      scaleCaloriesForPortions(
                          recipe.calories_per_portion,
                          portionCount,
                      ),
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

            <RecipeHeroStats
                formattedCookingTime={formattedCookingTime}
                formattedCalories={formattedCalories}
                totalCalories={totalCalories}
                formattedDate={formattedDate}
                isOwner={recipe.isOwner}
            />

            {recipe.isOwner ? (
                <div className={styles["recipe-hero__actions"]}>
                    <OwnerActions
                        editTo={editTo}
                        onDelete={onDelete}
                        editLabel={t("recipeDetailsPage.editButton")}
                        deleteLabel={t("recipeDetailsPage.deleteButton")}
                        favouriteLabel={favouriteLabel}
                        onLogIntake={onLogIntake}
                        logIntakeLabel={t("recipeDetailsPage.logIntake")}
                    />
                </div>
            ) : (
                <div className={styles["recipe-hero__visitor-actions"]}>
                    <button
                        type="button"
                        disabled
                        aria-label={favouriteLabel}
                        className={styles["recipe-hero__visitor-favourite"]}
                    >
                        <Heart size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                        {favouriteLabel}
                    </button>
                    {onLogIntake && (
                        <Button
                            variant="secondary"
                            className={
                                styles["recipe-hero__visitor-log-intake"]
                            }
                            onClick={onLogIntake}
                        >
                            <Flame
                                size={FAVOURITE_ICON_SIZE}
                                aria-hidden="true"
                            />
                            {t("recipeDetailsPage.logIntake")}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
