import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeStatistics } from "types/stats";

import { useLocale } from "hooks/useLocale";

import { StatTile } from "components/stats/StatTile";

import { formatKcal } from "utils/calories";
import { recipeTypeName } from "utils/referenceLabels";

import styles from "./RecipeStatsSection.module.scss";

interface RecipeStatsTilesProps {
    stats: RecipeStatistics;
    menusCount: number;
    formatTime: (totalMinutes: number) => string;
}

const DASH = "—";

export const RecipeStatsTiles: React.FC<RecipeStatsTilesProps> = ({
    stats,
    menusCount,
    formatTime,
}) => {
    const { t } = useTranslation("stats");
    const locale = useLocale();

    return (
        <div className={styles["recipe-stats-section__tiles"]}>
            <StatTile
                label={t("statsPage.totalRecipesTile")}
                value={stats.recipesCount}
                caption={t("statsPage.acrossAppCaption")}
            />
            <StatTile
                label={t("statsPage.totalMenusTile")}
                value={menusCount}
                caption={t("statsPage.acrossAppCaption")}
            />
            <StatTile
                label={t("statsPage.avgCookingTimeTile")}
                value={
                    stats.averageCookingTimeOverall !== null
                        ? formatTime(stats.averageCookingTimeOverall)
                        : DASH
                }
                caption={t("statsPage.avgCookingTimeCaption")}
            />
            <StatTile
                label={t("statsPage.mostUsedTypeTile")}
                value={
                    stats.mostUsedType
                        ? recipeTypeName(t, stats.mostUsedType.typeName)
                        : DASH
                }
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
            <StatTile
                label={t("statsPage.avgCaloriesTile")}
                value={
                    stats.averageCaloriesOverall !== null
                        ? t("statsPage.caloriesValue", {
                              count: formatKcal(
                                  stats.averageCaloriesOverall,
                                  locale,
                              ),
                          })
                        : DASH
                }
                caption={t("statsPage.perRecipeCaption")}
            />
        </div>
    );
};
