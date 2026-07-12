import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuStatistics } from "types/stats";

import { StatCard } from "components/stats/StatCard";
import { TwoColumnStatList } from "components/stats/TwoColumnStatList";

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

    return (
        <div className={styles["menu-stats-section__grid"]}>
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
                            })),
                    }}
                />
            </StatCard>
        </div>
    );
};
