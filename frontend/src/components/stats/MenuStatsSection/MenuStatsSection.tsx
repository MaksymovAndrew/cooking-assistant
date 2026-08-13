import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuStatistics } from "types/stats";

import { MenuCategoryChart } from "components/stats/MenuCategoryChart";
import { StatBarList } from "components/stats/StatBarList";
import { StatCard } from "components/stats/StatCard";
import { StatTile } from "components/stats/StatTile";

import { formatKcal } from "utils/calories";
import { splitCookingTime } from "utils/cookingTimeUtils";

import { MenuExtremesCards } from "./MenuExtremesCards";
import styles from "./MenuStatsSection.module.scss";

const AVG_RECIPES_FRACTION_DIGITS = 1;

export const MenuStatsSection: React.FC<{ stats: MenuStatistics }> = ({
    stats,
}) => {
    const { t } = useTranslation("stats");
    const perMenuCaption = t("statsPage.perMenuCaption");

    const formatCompactTime = (totalMinutes: number): string => {
        const { hours, minutes } = splitCookingTime(totalMinutes);

        return hours > 0
            ? t("statsPage.timeCompactHoursMinutes", { hours, minutes })
            : t("statsPage.timeMinutesOnly", { minutes });
    };

    return (
        <section className={styles["menu-stats-section"]}>
            <h1 className={styles["menu-stats-section__heading"]}>
                {t("statsPage.menuSectionHeading")}
            </h1>

            <div className={styles["menu-stats-section__tiles"]}>
                <StatTile
                    label={t("statsPage.totalMenusTile")}
                    value={stats.menusCount}
                    caption={t("statsPage.acrossAppCaption")}
                />
                <StatTile
                    label={t("statsPage.avgTotalTimeTile")}
                    value={
                        stats.averageTotalTime !== null
                            ? formatCompactTime(stats.averageTotalTime)
                            : "—"
                    }
                    caption={perMenuCaption}
                />
                <StatTile
                    label={t("statsPage.avgRecipesTile")}
                    value={
                        stats.averageRecipesPerMenu !== null
                            ? stats.averageRecipesPerMenu.toFixed(
                                  AVG_RECIPES_FRACTION_DIGITS,
                              )
                            : "—"
                    }
                    caption={perMenuCaption}
                />
                <StatTile
                    label={t("statsPage.mostUsedCategoryTile")}
                    value={stats.mostUsedCategory?.categoryname ?? "—"}
                    valueVariant="text"
                    caption={
                        stats.mostUsedCategory
                            ? t("statsPage.mostUsedCategoryCaption", {
                                  count: stats.mostUsedCategory.menuCount,
                                  total: stats.menusCount,
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
                                  ),
                              })
                            : "—"
                    }
                    caption={perMenuCaption}
                />
            </div>

            <div className={styles["menu-stats-section__grid"]}>
                <StatCard>
                    <h2 className={styles["menu-stats-section__card-title"]}>
                        {t("statsPage.menuCategoriesHeading")}
                    </h2>
                    <p className={styles["menu-stats-section__card-subtitle"]}>
                        {t("statsPage.menuCategoriesSubtitle", {
                            count: stats.menusCount,
                        })}
                    </p>
                    <MenuCategoryChart categories={stats.menuCountByCategory} />
                </StatCard>
                <StatCard>
                    <h2 className={styles["menu-stats-section__card-title"]}>
                        {t("statsPage.avgTimeByCategoryHeading")}
                    </h2>
                    <p className={styles["menu-stats-section__card-subtitle"]}>
                        {t("statsPage.avgTimeByCategorySubtitle")}
                    </p>
                    <StatBarList
                        items={stats.averageTotalTimeByCategory.map(
                            (entry) => ({
                                label: entry.categoryname,
                                value: entry.averageTotalTime,
                                displayValue: formatCompactTime(
                                    entry.averageTotalTime,
                                ),
                            }),
                        )}
                    />
                </StatCard>
            </div>

            <MenuExtremesCards stats={stats} formatTime={formatCompactTime} />
        </section>
    );
};
