import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeStatistics } from "types/stats";

import { RecipeTypeChart } from "components/stats/RecipeTypeChart";
import { StatBarList } from "components/stats/StatBarList";
import { StatCard } from "components/stats/StatCard";
import { StatTile } from "components/stats/StatTile";

import { splitCookingTime } from "utils/cookingTimeUtils";

import { RecipeExtremesCards } from "./RecipeExtremesCards";
import styles from "./RecipeStatsSection.module.scss";

interface RecipeStatsSectionProps {
    stats: RecipeStatistics;
    menusCount: number;
}

export const RecipeStatsSection: React.FC<RecipeStatsSectionProps> = ({
    stats,
    menusCount,
}) => {
    const { t } = useTranslation("stats");

    const formatCompactTime = (totalMinutes: number): string => {
        const { hours, minutes } = splitCookingTime(totalMinutes);

        return hours > 0
            ? t("statsPage.timeCompactHoursMinutes", { hours, minutes })
            : t("statsPage.timeMinutesOnly", { minutes });
    };

    return (
        <section className={styles["recipe-stats-section"]}>
            <h1 className={styles["recipe-stats-section__heading"]}>
                {t("statsPage.recipeSectionHeading")}
            </h1>

            <div className={styles["recipe-stats-section__tiles"]}>
                <StatTile
                    label={t("statsPage.totalRecipesTile")}
                    value={stats.recipesCount}
                    caption={t("statsPage.totalRecipesCaption")}
                />
                <StatTile
                    label={t("statsPage.totalMenusTile")}
                    value={menusCount}
                    caption={t("statsPage.totalMenusCaption")}
                />
                <StatTile
                    label={t("statsPage.avgCookingTimeTile")}
                    value={
                        stats.averageCookingTimeOverall !== null
                            ? formatCompactTime(stats.averageCookingTimeOverall)
                            : "—"
                    }
                    caption={t("statsPage.avgCookingTimeCaption")}
                />
                <StatTile
                    label={t("statsPage.mostUsedTypeTile")}
                    value={stats.mostUsedType?.typeName ?? "—"}
                    valueVariant="text"
                    caption={
                        stats.mostUsedType
                            ? t("statsPage.mostUsedCaption", {
                                  count: stats.mostUsedType.count,
                                  total: stats.recipesCount,
                              })
                            : undefined
                    }
                />
            </div>

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
                        }))}
                    />
                </StatCard>
            </div>

            <RecipeExtremesCards stats={stats} formatTime={formatCompactTime} />
        </section>
    );
};
