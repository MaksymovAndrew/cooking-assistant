import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuStatistics } from "types/stats";

import { MenuCategoryChart } from "components/stats/MenuCategoryChart";
import { StatBarList } from "components/stats/StatBarList";
import { StatCard } from "components/stats/StatCard";

import { formatCompactDuration } from "utils/cookingTimeUtils";
import { menuCategoryName } from "utils/referenceLabels";

import { MenuExtremesCards } from "./MenuExtremesCards";
import styles from "./MenuStatsSection.module.scss";
import { MenuStatsTiles } from "./MenuStatsTiles";

export const MenuStatsSection: React.FC<{ stats: MenuStatistics }> = ({
    stats,
}) => {
    const { t } = useTranslation("stats");

    const formatCompactTime = (totalMinutes: number): string =>
        formatCompactDuration(t, totalMinutes);

    return (
        <section className={styles["menu-stats-section"]}>
            <h1 className={styles["menu-stats-section__heading"]}>
                {t("statsPage.menuSectionHeading")}
            </h1>

            <MenuStatsTiles stats={stats} formatTime={formatCompactTime} />

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
                                label: menuCategoryName(t, entry.categoryname),
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
