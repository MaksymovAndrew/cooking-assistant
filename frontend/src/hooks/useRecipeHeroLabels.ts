import { useTranslation } from "react-i18next";

import type { RecipeDetails } from "types/recipe";

import {
    formatKcal,
    roundCalories,
    scaleCaloriesForPortions,
} from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";
import { formatFullDate } from "utils/dateUtils";

interface RecipeHeroLabels {
    formattedCookingTime: string;
    formattedCalories: string;
    totalCalories: string | null;
    formattedDate: string;
}

export const useRecipeHeroLabels = (
    recipe: RecipeDetails,
    portionCount: number,
): RecipeHeroLabels => {
    const { t } = useTranslation("recipes");
    const { hours, minutes } = splitCookingTime(recipe.cooking_time ?? 0);
    const durationLabel =
        hours > 0
            ? t("recipeDetailsPage.cookingTimeHoursMinutes", { hours, minutes })
            : t("recipeDetailsPage.cookingTimeMinutes", { minutes });

    return {
        // a recipe can carry no cooking time at all - the column is nullable
        formattedCookingTime:
            recipe.cooking_time === null
                ? t("recipeDetailsPage.cookingTimeUnavailable")
                : durationLabel,
        formattedCalories:
            recipe.calories_per_portion === null
                ? t("recipeDetailsPage.caloriesUnavailable")
                : t("recipeDetailsPage.caloriesPerPortion", {
                      count: formatKcal(
                          roundCalories(recipe.calories_per_portion),
                      ),
                  }),
        totalCalories:
            recipe.calories_per_portion === null || portionCount === 1
                ? null
                : t("recipeDetailsPage.caloriesTotal", {
                      count: formatKcal(
                          scaleCaloriesForPortions(
                              recipe.calories_per_portion,
                              portionCount,
                          ),
                      ),
                  }),
        formattedDate: formatFullDate(recipe.creation_date),
    };
};
