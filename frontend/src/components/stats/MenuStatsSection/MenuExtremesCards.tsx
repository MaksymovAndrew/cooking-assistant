import React from "react";
import { useTranslation } from "react-i18next";

import { menuDetailsPath } from "constants/routes";
import type { MenuStatistics } from "types/stats";

import { StatCard } from "components/stats/StatCard";
import { TwoColumnStatList } from "components/stats/TwoColumnStatList";

import { formatKcalCompact } from "utils/calories";

import styles from "./MenuStatsSection.module.scss";

const EXTREME_LIST_LIMIT = 3;

interface MenuExtremesCardsProps {
    stats: MenuStatistics;
    formatTime: (totalMinutes: number) => string;
}

export const MenuExtremesCards: React.FC<MenuExtremesCardsProps> = ({
    stats,
    formatTime,
}) => {
    const { t } = useTranslation("stats");
    const formatCalories = (calories: number) =>
        t("statsPage.caloriesValue", { count: formatKcalCompact(calories) });

    return (
        <div className={styles["menu-stats-section__extremes-grid"]}>
            <StatCard>
                <h2 className={styles["menu-stats-section__card-title"]}>
                    {t("statsPage.totalTimeExtremesHeading")}
                </h2>
                <TwoColumnStatList
                    left={{
                        label: t("statsPage.fastest"),
                        tone: "success",
                        items: stats.fastestMenus
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((m) => ({
                                key: m.id,
                                name: m.title,
                                value: formatTime(m.total_cooking_time),
                                to: menuDetailsPath(m.id),
                            })),
                    }}
                    right={{
                        label: t("statsPage.slowest"),
                        tone: "warning",
                        items: stats.slowestMenus
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((m) => ({
                                key: m.id,
                                name: m.title,
                                value: formatTime(m.total_cooking_time),
                                to: menuDetailsPath(m.id),
                            })),
                    }}
                />
            </StatCard>
            <StatCard>
                <h2 className={styles["menu-stats-section__card-title"]}>
                    {t("statsPage.recipeCountsHeading")}
                </h2>
                <TwoColumnStatList
                    left={{
                        label: t("statsPage.most"),
                        tone: "brand",
                        items: stats.mostRecipesMenus
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((m) => ({
                                key: m.id,
                                name: m.title,
                                value: String(m.recipe_count),
                                to: menuDetailsPath(m.id),
                            })),
                    }}
                    right={{
                        label: t("statsPage.least"),
                        tone: "muted",
                        items: stats.leastRecipesMenus
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((m) => ({
                                key: m.id,
                                name: m.title,
                                value: String(m.recipe_count),
                                to: menuDetailsPath(m.id),
                            })),
                    }}
                />
            </StatCard>
            <StatCard>
                <h2 className={styles["menu-stats-section__card-title"]}>
                    {t("statsPage.calorieExtremesHeading")}
                </h2>
                <TwoColumnStatList
                    left={{
                        label: t("statsPage.most"),
                        tone: "brand",
                        items: stats.mostCaloricMenus
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((m) => ({
                                key: m.id,
                                name: m.title,
                                value: formatCalories(m.total_calories),
                                to: menuDetailsPath(m.id),
                            })),
                    }}
                    right={{
                        label: t("statsPage.least"),
                        tone: "muted",
                        items: stats.leastCaloricMenus
                            .slice(0, EXTREME_LIST_LIMIT)
                            .map((m) => ({
                                key: m.id,
                                name: m.title,
                                value: formatCalories(m.total_calories),
                                to: menuDetailsPath(m.id),
                            })),
                    }}
                />
            </StatCard>
        </div>
    );
};
