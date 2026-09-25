import React from "react";
import { useTranslation } from "react-i18next";

import { recipeDetailsPath } from "constants/routes";
import type { RecipeStatistics } from "types/stats";

import { useLocale } from "hooks/useLocale";

import {
    extremeItems,
    StatExtremesGrid,
} from "components/stats/StatExtremesGrid";

import { formatKcalCompact } from "utils/calories";

interface RecipeExtremesCardsProps {
    stats: RecipeStatistics;
    formatTime: (totalMinutes: number) => string;
}

export const RecipeExtremesCards: React.FC<RecipeExtremesCardsProps> = ({
    stats,
    formatTime,
}) => {
    const { t } = useTranslation("stats");
    const locale = useLocale();
    const items = <T extends { id: number; title: string }>(
        records: T[],
        value: (record: T) => string,
    ) => extremeItems(records, value, recipeDetailsPath);
    const time = (record: { cookingTime: number }) =>
        formatTime(record.cookingTime);
    const ingredients = (record: { ingredientCount: number }) =>
        String(record.ingredientCount);
    const calories = (record: { caloriesPerPortion: number }) =>
        t("statsPage.caloriesValue", {
            count: formatKcalCompact(record.caloriesPerPortion, locale),
        });

    return (
        <StatExtremesGrid
            cards={[
                {
                    heading: t("statsPage.cookingTimeExtremesHeading"),
                    pair: "time",
                    columns: [
                        items(stats.fastestRecipes, time),
                        items(stats.slowestRecipes, time),
                    ],
                },
                {
                    heading: t("statsPage.ingredientCountsHeading"),
                    pair: "amount",
                    columns: [
                        items(stats.mostIngredientsRecipes, ingredients),
                        items(stats.leastIngredientsRecipes, ingredients),
                    ],
                },
                {
                    heading: t("statsPage.calorieExtremesHeading"),
                    pair: "amount",
                    columns: [
                        items(stats.mostCaloricRecipes, calories),
                        items(stats.leastCaloricRecipes, calories),
                    ],
                },
            ]}
        />
    );
};
