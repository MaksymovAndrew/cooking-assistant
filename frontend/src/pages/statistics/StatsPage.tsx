import React from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "redux/hooks";
import { selectMenuStatistics } from "redux/selectors/statisticsSelectors";
import { useGetAllMenusQuery } from "redux/services/menusApi";
import { useGetRecipeStatsQuery } from "redux/services/recipesApi";

import { usePageTitle } from "hooks/usePageTitle";

import { AppShell } from "components/layout/AppShell";
import { MenuStatsSection } from "components/stats/MenuStatsSection";
import { RecipeStatsSection } from "components/stats/RecipeStatsSection";
import { ErrorState } from "components/ui/ErrorState";

import styles from "./StatsPage.module.scss";

const StatsPage: React.FC = () => {
    const { t } = useTranslation("stats");

    useGetAllMenusQuery(null);
    const {
        data: recipeStats,
        isError,
        refetch,
    } = useGetRecipeStatsQuery(null);
    const menuStats = useAppSelector(selectMenuStatistics);

    usePageTitle(t("common:nav.stats"));

    if (isError) {
        return (
            <AppShell>
                <ErrorState
                    title={t("statsPage.error", {
                        message: t("statsPage.errorFetch"),
                    })}
                    onRetry={() => {
                        refetch().catch(() => undefined);
                    }}
                    retryLabel={t("common:errorState.retry")}
                />
            </AppShell>
        );
    }

    if (!recipeStats) {
        return (
            <AppShell>
                <p>{t("statsPage.loading")}</p>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className={styles["stats-page"]}>
                <RecipeStatsSection
                    stats={recipeStats}
                    menusCount={menuStats.menusCount}
                />
                <MenuStatsSection stats={menuStats} />
            </div>
        </AppShell>
    );
};

export default StatsPage;
