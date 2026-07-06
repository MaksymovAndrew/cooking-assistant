import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeStatistics } from "types/stats";

import { RecipeExtremeList } from "components/stats/RecipeExtremeList";
import { RecipeTypeChart } from "components/stats/RecipeTypeChart";
import { StatBarList } from "components/stats/StatBarList";
import { StatCard } from "components/stats/StatCard";
import { StatTile } from "components/stats/StatTile";

import { parseCookingTime } from "utils/cookingTimeUtils";

import styles from "./RecipeStatsSection.module.scss";

const EXTREME_LIST_LIMIT = 3;

export const RecipeStatsSection: React.FC<{ stats: RecipeStatistics }> = ({
    stats,
}) => {
    const { t } = useTranslation("stats");

    return (
        <section className={styles["recipe-stats-section"]}>
            <h1 className={styles["recipe-stats-section__heading"]}>
                {t("statsPage.recipeSectionHeading")}
            </h1>

            <div className={styles["recipe-stats-section__tiles"]}>
                <StatTile
                    label={t("statsPage.totalRecipesTile")}
                    value={stats.recipesCount}
                />
                <StatTile
                    label={t("statsPage.avgCookingTimeTile")}
                    value={stats.averageCookingTimeOverall ?? "—"}
                />
                <StatTile
                    label={t("statsPage.mostUsedTypeTile")}
                    value={stats.mostUsedType?.typeName ?? "—"}
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
                    <RecipeTypeChart stats={stats.stats} />
                </StatCard>
                <StatCard>
                    <h2 className={styles["recipe-stats-section__card-title"]}>
                        {t("statsPage.avgTimeByTypeHeading")}
                    </h2>
                    <StatBarList
                        items={stats.averageCookingTimesByType.map((entry) => ({
                            label: entry.typeName,
                            value:
                                parseCookingTime(entry.averageCookingTime) ?? 0,
                            displayValue: entry.averageCookingTime,
                        }))}
                    />
                </StatCard>
            </div>

            <div className={styles["recipe-stats-section__grid"]}>
                <StatCard>
                    <RecipeExtremeList
                        label={t("statsPage.fastestRecipes")}
                        recipes={stats.fastestRecipes.slice(
                            0,
                            EXTREME_LIST_LIMIT,
                        )}
                        unit={t("statsPage.cookingTimeUnit")}
                        getValue={(r) => r.cooking_time}
                    />
                    <RecipeExtremeList
                        label={t("statsPage.slowestRecipes")}
                        recipes={stats.slowestRecipes.slice(
                            0,
                            EXTREME_LIST_LIMIT,
                        )}
                        unit={t("statsPage.cookingTimeUnit")}
                        getValue={(r) => r.cooking_time}
                    />
                </StatCard>
                <StatCard>
                    <RecipeExtremeList
                        label={t("statsPage.mostIngredients")}
                        recipes={stats.mostIngredientsRecipes.slice(
                            0,
                            EXTREME_LIST_LIMIT,
                        )}
                        unit={t("statsPage.ingredientsUnit")}
                        getValue={(r) => r.ingredients.length}
                    />
                    <RecipeExtremeList
                        label={t("statsPage.leastIngredients")}
                        recipes={stats.leastIngredientsRecipes.slice(
                            0,
                            EXTREME_LIST_LIMIT,
                        )}
                        unit={t("statsPage.ingredientsUnit")}
                        getValue={(r) => r.ingredients.length}
                    />
                </StatCard>
            </div>
        </section>
    );
};
