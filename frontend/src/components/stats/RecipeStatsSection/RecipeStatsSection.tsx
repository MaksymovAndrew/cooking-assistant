import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeStatistics } from "types/stats";

import { getChartColor } from "components/stats/PieChartCard/chartColors";
import { RecipeTypeChart } from "components/stats/RecipeTypeChart";
import { StatBarList } from "components/stats/StatBarList";
import { StatCard } from "components/stats/StatCard";

import { formatCompactDuration } from "utils/cookingTimeUtils";

import { RecipeExtremesCards } from "./RecipeExtremesCards";
import styles from "./RecipeStatsSection.module.scss";
import { RecipeStatsTiles } from "./RecipeStatsTiles";

interface RecipeStatsSectionProps {
    stats: RecipeStatistics;
    menusCount: number;
}

export const RecipeStatsSection: React.FC<RecipeStatsSectionProps> = ({
    stats,
    menusCount,
}) => {
    const { t } = useTranslation("stats");

    // keyed by type name (not array index) so a given recipe type keeps the same color here as in the donut chart, even if the two lists differ in order or length
    const colorByTypeName = new Map(
        stats.stats.map((entry, index) => [
            entry.typeName,
            getChartColor(index),
        ]),
    );

    const formatCompactTime = (totalMinutes: number): string =>
        formatCompactDuration(t, totalMinutes);

    return (
        <section className={styles["recipe-stats-section"]}>
            <h1 className={styles["recipe-stats-section__heading"]}>
                {t("statsPage.recipeSectionHeading")}
            </h1>

            <RecipeStatsTiles
                stats={stats}
                menusCount={menusCount}
                formatTime={formatCompactTime}
            />

            <div className={styles["recipe-stats-section__grid"]}>
                <StatCard>
                    <h2 className={styles["recipe-stats-section__card-title"]}>
                        {t("statsPage.recipeTypesHeading")}
                    </h2>
                    <p
                        className={
                            styles["recipe-stats-section__card-subtitle"]
                        }
                    >
                        {t("statsPage.recipeTypesSubtitle", {
                            count: stats.recipesCount,
                        })}
                    </p>
                    <RecipeTypeChart stats={stats.stats} />
                </StatCard>
                <StatCard>
                    <h2 className={styles["recipe-stats-section__card-title"]}>
                        {t("statsPage.avgTimeByTypeHeading")}
                    </h2>
                    <p
                        className={
                            styles["recipe-stats-section__card-subtitle"]
                        }
                    >
                        {t("statsPage.avgTimeByTypeSubtitle")}
                    </p>
                    <StatBarList
                        items={stats.averageCookingTimesByType.map((entry) => ({
                            label: entry.typeName,
                            value: entry.averageCookingTime,
                            displayValue: formatCompactTime(
                                entry.averageCookingTime,
                            ),
                            color: colorByTypeName.get(entry.typeName),
                        }))}
                    />
                </StatCard>
            </div>

            <RecipeExtremesCards stats={stats} formatTime={formatCompactTime} />
        </section>
    );
};
