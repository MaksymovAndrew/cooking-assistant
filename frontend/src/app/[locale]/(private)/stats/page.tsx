"use client";

import { ChartPie } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useAppSelector } from "redux/hooks";
import { selectMenuStatistics } from "redux/selectors/statisticsSelectors";
import { useGetAllMenusQuery } from "redux/services/menusApi";
import { useGetRecipeStatsQuery } from "redux/services/recipesApi";

import { usePageTitle } from "hooks/usePageTitle";

import { AppShell } from "components/layout/AppShell";
import { MenuStatsSection } from "components/stats/MenuStatsSection";
import { RecipeStatsSection } from "components/stats/RecipeStatsSection";
import { StatsSkeleton } from "components/stats/StatsSkeleton";
import { EmptyState } from "components/ui/EmptyState";
import { ErrorState } from "components/ui/ErrorState";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./page.module.scss";

const StatsPage: React.FC = () => {
    const { t } = useTranslation("stats");
    const menus = useGetAllMenusQuery(null);
    const recipes = useGetRecipeStatsQuery(null);
    const menuStats = useAppSelector(selectMenuStatistics);
    const recipeStats = recipes.data;

    usePageTitle(t("common:nav.stats"));

    const renderContent = () => {
        if (recipes.isError || menus.isError) {
            return (
                <ErrorState
                    title={t("statsPage.error", {
                        message: t("statsPage.errorFetch"),
                    })}
                    onRetry={() => {
                        Promise.all([recipes.refetch(), menus.refetch()]).catch(
                            () => undefined,
                        );
                    }}
                    retryLabel={t("common:errorState.retry")}
                />
            );
        }

        if (!recipeStats || !menus.data) {
            return <StatsSkeleton />;
        }

        if (recipeStats.recipesCount === 0) {
            return (
                <EmptyState
                    icon={ChartPie}
                    title={t("statsPage.emptyTitle")}
                    description={t("statsPage.emptyDescription")}
                    action={
                        <LinkButton href={ROUTES.addRecipe}>
                            {t("statsPage.emptyAction")}
                        </LinkButton>
                    }
                />
            );
        }

        return (
            <>
                <RecipeStatsSection
                    stats={recipeStats}
                    menusCount={menuStats.menusCount}
                />
                <MenuStatsSection stats={menuStats} />
            </>
        );
    };

    return (
        <AppShell>
            <div className={styles["stats-page"]}>{renderContent()}</div>
        </AppShell>
    );
};

export default StatsPage;
