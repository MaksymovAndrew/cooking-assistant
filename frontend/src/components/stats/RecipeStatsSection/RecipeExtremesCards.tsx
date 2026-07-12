import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeStatistics } from "types/stats";

import { StatCard } from "components/stats/StatCard";
import { TwoColumnStatList } from "components/stats/TwoColumnStatList";

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

    return (
        <div className={styles["recipe-stats-section__grid"]}>
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
                                value: formatTime(r.cooking_time),
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
                                value: formatTime(r.cooking_time),
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
                                value: String(r.ingredients.length),
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
                                value: String(r.ingredients.length),
                            })),
                    }}
                />
            </StatCard>
        </div>
    );
};
