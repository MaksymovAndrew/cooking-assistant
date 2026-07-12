import { Calendar, Clock } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { recipeDetailsPath } from "constants/routes";

import type { ContentCardVariant } from "components/cards/ContentCard";
import { ContentCard } from "components/cards/ContentCard";
import { UtensilsMark } from "components/icons";

import { splitCookingTime } from "utils/cookingTimeUtils";
import { formatShortDate } from "utils/dateUtils";
import { filterAllergens } from "utils/recipeAllergens";

interface RecipeCardIngredient {
    allergens: string | null;
}

interface RecipeCardRecipe {
    id: number;
    title: string;
    type_name: string;
    cooking_time: number;
    creation_date: string;
    ingredients?: RecipeCardIngredient[];
}

interface RecipeCardProps {
    recipe: RecipeCardRecipe;
    mine?: boolean;
    variant?: ContentCardVariant;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
    recipe,
    mine = false,
    variant,
}) => {
    const { t } = useTranslation("recipes");
    const { hours, minutes } = splitCookingTime(recipe.cooking_time);
    const hasAllergens =
        filterAllergens((recipe.ingredients ?? []).map((i) => i.allergens))
            .length > 0;

    return (
        <ContentCard
            to={recipeDetailsPath(recipe.id)}
            title={recipe.title}
            imageIcon={UtensilsMark}
            chipLabel={recipe.type_name}
            mine={mine}
            variant={variant}
            badge={hasAllergens}
            metaItems={[
                {
                    icon: Clock,
                    label: t("recipeCard.cookingTimeValue", { hours, minutes }),
                },
                {
                    icon: Calendar,
                    label: formatShortDate(recipe.creation_date),
                },
            ]}
        />
    );
};
