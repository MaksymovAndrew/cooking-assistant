import React from "react";
import { useTranslation } from "react-i18next";

import { menuDetailsPath } from "constants/routes";
import type { MenuStatistics } from "types/stats";

import {
    extremeItems,
    StatExtremesGrid,
} from "components/stats/StatExtremesGrid";

import { formatKcalCompact } from "utils/calories";

interface MenuExtremesCardsProps {
    stats: MenuStatistics;
    formatTime: (totalMinutes: number) => string;
}

export const MenuExtremesCards: React.FC<MenuExtremesCardsProps> = ({
    stats,
    formatTime,
}) => {
    const { t } = useTranslation("stats");
    const items = <T extends { id: number; title: string }>(
        records: T[],
        value: (record: T) => string,
    ) => extremeItems(records, value, menuDetailsPath);
    const time = (record: { total_cooking_time: number }) =>
        formatTime(record.total_cooking_time);
    const recipes = (record: { recipe_count: number }) =>
        String(record.recipe_count);
    const calories = (record: { total_calories: number }) =>
        t("statsPage.caloriesValue", {
            count: formatKcalCompact(record.total_calories),
        });

    return (
        <StatExtremesGrid
            cards={[
                {
                    heading: t("statsPage.totalTimeExtremesHeading"),
                    pair: "time",
                    columns: [
                        items(stats.fastestMenus, time),
                        items(stats.slowestMenus, time),
                    ],
                },
                {
                    heading: t("statsPage.recipeCountsHeading"),
                    pair: "amount",
                    columns: [
                        items(stats.mostRecipesMenus, recipes),
                        items(stats.leastRecipesMenus, recipes),
                    ],
                },
                {
                    heading: t("statsPage.calorieExtremesHeading"),
                    pair: "amount",
                    columns: [
                        items(stats.mostCaloricMenus, calories),
                        items(stats.leastCaloricMenus, calories),
                    ],
                },
            ]}
        />
    );
};
