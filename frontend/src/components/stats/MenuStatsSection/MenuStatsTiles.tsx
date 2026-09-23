import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuStatistics } from "types/stats";

import { StatTile } from "components/stats/StatTile";

import { formatKcal } from "utils/calories";

import styles from "./MenuStatsSection.module.scss";

interface MenuStatsTilesProps {
    stats: MenuStatistics;
    formatTime: (totalMinutes: number) => string;
}

const AVG_RECIPES_FRACTION_DIGITS = 1;
const NO_VALUE = "—";

export const MenuStatsTiles: React.FC<MenuStatsTilesProps> = ({
    stats,
    formatTime,
}) => {
    const { t } = useTranslation("stats");
    const perMenuCaption = t("statsPage.perMenuCaption");
    const { mostUsedCategory } = stats;

    return (
        <div className={styles["menu-stats-section__tiles"]}>
            <StatTile
                label={t("statsPage.totalMenusTile")}
                value={stats.menusCount}
                caption={t("statsPage.acrossAppCaption")}
            />
            <StatTile
                label={t("statsPage.avgTotalTimeTile")}
                value={
                    stats.averageTotalTime === null
                        ? NO_VALUE
                        : formatTime(stats.averageTotalTime)
                }
                caption={perMenuCaption}
            />
            <StatTile
                label={t("statsPage.avgRecipesTile")}
                value={
                    stats.averageRecipesPerMenu?.toFixed(
                        AVG_RECIPES_FRACTION_DIGITS,
                    ) ?? NO_VALUE
                }
                caption={perMenuCaption}
            />
            <StatTile
                label={t("statsPage.mostUsedCategoryTile")}
                value={mostUsedCategory?.categoryname ?? NO_VALUE}
                valueVariant="text"
                caption={
                    mostUsedCategory
                        ? t("statsPage.mostUsedCategoryCaption", {
                              count: mostUsedCategory.menuCount,
                              total: stats.menusCount,
                          })
                        : undefined
                }
            />
            <StatTile
                label={t("statsPage.avgCaloriesTile")}
                value={
                    stats.averageCaloriesOverall === null
                        ? NO_VALUE
                        : t("statsPage.caloriesValue", {
                              count: formatKcal(stats.averageCaloriesOverall),
                          })
                }
                caption={perMenuCaption}
            />
        </div>
    );
};
