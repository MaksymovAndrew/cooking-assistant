import { Clock, Flame } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { FAVOURITE_TARGET } from "constants/favourites";
import { recipeDetailsPath } from "constants/routes";

import { useLocale } from "hooks/useLocale";

import type { ContentCardVariant } from "components/cards/ContentCard";
import {
    cardFavourite,
    cardRating,
    ContentCard,
    META_ITEM_TONE_CALORIE_OVER,
} from "components/cards/ContentCard";
import { UtensilsMark } from "components/icons";

import { formatKcal, roundCalories } from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";
import { mediaUrl } from "utils/mediaUrl";
import { filterAllergens } from "utils/recipeAllergens";
import { recipeTypeName } from "utils/referenceLabels";

interface RecipeCardIngredient {
    allergens: string[];
}

interface RecipeCardRecipe {
    id: number;
    title: string;
    type_name: string;
    cooking_time: number;
    calories_per_portion: number | null;
    ingredients?: RecipeCardIngredient[];
    isFavourite?: boolean | null;
    containsAvoided?: boolean | null;
    photo_key?: string | null;
    ratingAverage?: number | null;
    ratingCount?: number;
}

interface RecipeCardProps {
    recipe: RecipeCardRecipe;
    mine?: boolean;
    variant?: ContentCardVariant;
    exceedsBudget?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
    recipe,
    mine = false,
    variant,
    exceedsBudget = false,
}) => {
    const { t } = useTranslation("recipes");
    const locale = useLocale();
    const { hours, minutes } = splitCookingTime(recipe.cooking_time);
    const hasAllergens =
        filterAllergens((recipe.ingredients ?? []).flatMap((i) => i.allergens))
            .length > 0;

    return (
        <ContentCard
            href={recipeDetailsPath(recipe.id)}
            title={recipe.title}
            imageIcon={UtensilsMark}
            imageSrc={mediaUrl(recipe.photo_key, "card")}
            chipLabel={recipeTypeName(t, recipe.type_name)}
            mine={mine}
            variant={variant}
            badge={hasAllergens}
            avoided={recipe.containsAvoided === true}
            calorieOver={exceedsBudget}
            rating={cardRating(recipe)}
            favourite={cardFavourite(FAVOURITE_TARGET.recipe, recipe)}
            metaItems={[
                {
                    icon: Clock,
                    label: t("recipeCard.cookingTimeValue", { hours, minutes }),
                },
                ...(recipe.calories_per_portion === null
                    ? []
                    : [
                          {
                              icon: Flame,
                              label: t("recipeCard.caloriesValue", {
                                  count: formatKcal(
                                      roundCalories(
                                          recipe.calories_per_portion,
                                      ),
                                      locale,
                                  ),
                              }),
                              ...(exceedsBudget
                                  ? {
                                        tone: META_ITEM_TONE_CALORIE_OVER,
                                        title: t(
                                            "common:contentCard.overBudgetTooltip",
                                        ),
                                    }
                                  : {}),
                          },
                      ]),
            ]}
        />
    );
};
