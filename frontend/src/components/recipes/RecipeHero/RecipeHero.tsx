import { Heart } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeDetails } from "types/recipe";

import { useAppSelector } from "redux/hooks";
import { selectViewerCapabilities } from "redux/selectors/viewerSelectors";

import { UtensilsMarkSimple } from "components/icons";
import { RecipeHeroStats } from "components/recipes/RecipeHero/RecipeHeroStats";
import { RecipeHeroVisitorActions } from "components/recipes/RecipeHero/RecipeHeroVisitorActions";
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
    exceedsBudget?: boolean;
}

const IMAGE_ICON_SIZE = 56;
const FAVOURITE_ICON_SIZE = 20;

export const RecipeHero: React.FC<RecipeHeroProps> = ({
    recipe,
    portionCount,
    editTo,
    onDelete,
    onLogIntake,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("recipes");
    const { canFavourite, canTrackCalories } = useAppSelector(
        selectViewerCapabilities,
    );
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
                {canFavourite && (
                    <button
                        type="button"
                        disabled
                        aria-label={favouriteLabel}
                        className={styles["recipe-hero__favourite"]}
                    >
                        <Heart size={FAVOURITE_ICON_SIZE} aria-hidden="true" />
                    </button>
                )}
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
                exceedsBudget={exceedsBudget}
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
                <RecipeHeroVisitorActions
                    canFavourite={canFavourite}
                    canTrackCalories={canTrackCalories}
                    favouriteLabel={favouriteLabel}
                    onLogIntake={onLogIntake}
                />
            )}
        </div>
    );
};
