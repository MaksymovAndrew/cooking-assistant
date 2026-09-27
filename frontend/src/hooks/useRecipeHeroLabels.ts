import { useTranslation } from "react-i18next";

import type { RecipeDetails } from "types/recipe";

import { useLocale } from "hooks/useLocale";

import {
    formatKcal,
    roundCalories,
    scaleCaloriesForPortions,
} from "utils/calories";
import { formatRecipeDuration } from "utils/cookingTimeUtils";
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
    const locale = useLocale();

    return {
        // a recipe can carry no cooking time at all - the column is nullable
        formattedCookingTime:
            recipe.cooking_time === null
                ? t("recipeDetailsPage.cookingTimeUnavailable")
                : formatRecipeDuration(t, recipe.cooking_time),
        formattedCalories:
            recipe.calories_per_portion === null
                ? t("recipeDetailsPage.caloriesUnavailable")
                : t("recipeDetailsPage.caloriesPerPortion", {
                      count: formatKcal(
                          roundCalories(recipe.calories_per_portion),
                          locale,
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
                          locale,
                      ),
                  }),
        formattedDate: formatFullDate(recipe.creation_date, locale),
    };
};
