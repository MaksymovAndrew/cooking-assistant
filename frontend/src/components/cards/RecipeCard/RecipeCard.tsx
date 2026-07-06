import { Calendar, Clock } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { recipeDetailsPath } from "constants/routes";

import { ContentCard } from "components/cards/ContentCard";
import { UtensilsMark } from "components/icons";

import { splitCookingTime } from "utils/cookingTimeUtils";
import { formatDate } from "utils/dateUtils";

interface RecipeCardRecipe {
    id: number;
    title: string;
    type_name: string;
    cooking_time: number;
    creation_date: string;
}

interface RecipeCardProps {
    recipe: RecipeCardRecipe;
    mine?: boolean;
    badge?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
    recipe,
    mine = false,
    badge = false,
}) => {
    const { t, i18n } = useTranslation("recipes");
    const { hours, minutes } = splitCookingTime(recipe.cooking_time);

    return (
        <ContentCard
            to={recipeDetailsPath(recipe.id)}
            title={recipe.title}
            imageIcon={UtensilsMark}
            chipLabel={recipe.type_name}
            mine={mine}
            badge={badge}
            metaItems={[
                {
                    icon: Clock,
                    label: t("recipeCard.cookingTimeValue", { hours, minutes }),
                },
                {
                    icon: Calendar,
                    label: formatDate(recipe.creation_date, i18n.language),
                },
            ]}
        />
    );
};
