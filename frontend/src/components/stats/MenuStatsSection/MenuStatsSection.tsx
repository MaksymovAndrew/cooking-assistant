import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuStatistics } from "types/stats";

import { MenuCategoryChart } from "components/stats/MenuCategoryChart";
import { StatCard } from "components/stats/StatCard";
import { StatTile } from "components/stats/StatTile";

import styles from "./MenuStatsSection.module.scss";

export const MenuStatsSection: React.FC<{ stats: MenuStatistics }> = ({
    stats,
}) => {
    const { t } = useTranslation("stats");

    return (
        <section className={styles["menu-stats-section"]}>
            <h1 className={styles["menu-stats-section__heading"]}>
                {t("statsPage.menuSectionHeading")}
            </h1>

            <div className={styles["menu-stats-section__tiles"]}>
                <StatTile
                    label={t("statsPage.totalMenusTile")}
                    value={stats.menusCount}
                />
                <StatTile
                    label={t("statsPage.mostUsedCategoryTile")}
                    value={stats.mostUsedCategory?.categoryname ?? "—"}
                    caption={
                        stats.mostUsedCategory
                            ? t("statsPage.mostUsedCategoryCaption", {
                                  count: stats.mostUsedCategory.menuCount,
                                  total: stats.menusCount,
                              })
                            : undefined
                    }
                />
            </div>

            <StatCard>
                <MenuCategoryChart categories={stats.menuCountByCategory} />
            </StatCard>
        </section>
    );
};
