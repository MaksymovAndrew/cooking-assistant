import React from "react";
import { useTranslation } from "react-i18next";

import { recipeDetailsPath } from "constants/routes";
import type { RecipeStatistics } from "types/stats";

import { StatCard } from "components/stats/StatCard";
import { TwoColumnStatList } from "components/stats/TwoColumnStatList";

import { formatKcalCompact } from "utils/calories";

import styles from "./RecipeStatsSection.module.scss";

const EXTREME_LIST_LIMIT = 3;

interface RecipeExtremesCardsProps {
    stats: RecipeStatistics;
    formatTime: (totalMinutes: number) => string;
}

export const RecipeExtremesCards: React.FC<RecipeExtremesCardsProps> = ({
    stats,
    formatTime,
}) => {
    const { t } = useTranslation("stats");
    const formatCalories = (calories: number) =>
        t("statsPage.caloriesValue", { count: formatKcalCompact(calories) });

    return (
        <div className={styles["recipe-stats-section__extremes-grid"]}>
            <StatCard>
                <h2 className={styles["recipe-stats-section__card-title"]}>
                    {t("statsPage.cookingTimeExtremesHeading")}
                </h2>
                <TwoColumnStatList
                    left={{
                        label: t("statsPage.fastest"),
                        tone: "success",
                        items: stats.fastestRecipes
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((r) => ({
                                key: r.id,
                                name: r.title,
                                value: formatTime(r.cookingTime),
                                to: recipeDetailsPath(r.id),
                            })),
                    }}
                    right={{
                        label: t("statsPage.slowest"),
                        tone: "warning",
                        items: stats.slowestRecipes
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((r) => ({
                                key: r.id,
                                name: r.title,
                                value: formatTime(r.cookingTime),
                                to: recipeDetailsPath(r.id),
                            })),
                    }}
                />
            </StatCard>
            <StatCard>
                <h2 className={styles["recipe-stats-section__card-title"]}>
                    {t("statsPage.ingredientCountsHeading")}
                </h2>
                <TwoColumnStatList
                    left={{
                        label: t("statsPage.most"),
                        tone: "brand",
                        items: stats.mostIngredientsRecipes
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((r) => ({
                                key: r.id,
                                name: r.title,
                                value: String(r.ingredientCount),
                                to: recipeDetailsPath(r.id),
                            })),
                    }}
                    right={{
                        label: t("statsPage.least"),
                        tone: "muted",
                        items: stats.leastIngredientsRecipes
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((r) => ({
                                key: r.id,
                                name: r.title,
                                value: String(r.ingredientCount),
                                to: recipeDetailsPath(r.id),
                            })),
                    }}
                />
            </StatCard>
            <StatCard>
                <h2 className={styles["recipe-stats-section__card-title"]}>
                    {t("statsPage.calorieExtremesHeading")}
                </h2>
                <TwoColumnStatList
                    left={{
                        label: t("statsPage.most"),
                        tone: "brand",
                        items: stats.mostCaloricRecipes
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((r) => ({
                                key: r.id,
                                name: r.title,
                                value: formatCalories(r.caloriesPerPortion),
                                to: recipeDetailsPath(r.id),
                            })),
                    }}
                    right={{
                        label: t("statsPage.least"),
                        tone: "muted",
                        items: stats.leastCaloricRecipes
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((r) => ({
                                key: r.id,
                                name: r.title,
                                value: formatCalories(r.caloriesPerPortion),
                                to: recipeDetailsPath(r.id),
                            })),
                    }}
                />
            </StatCard>
        </div>
    );
};
