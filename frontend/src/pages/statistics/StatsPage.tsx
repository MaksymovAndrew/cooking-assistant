import React from "react";

import { useAppSelector } from "redux/hooks";
import {
    selectMenuStatistics,
    selectRecipeStatistics,
} from "redux/selectors/statisticsSelectors";
import { useGetAllMenusQuery } from "redux/services/menusApi";
import { useGetAllRecipesQuery } from "redux/services/recipesApi";

import { AppShell } from "components/layout/AppShell";
import { MenuStatsSection } from "components/stats/MenuStatsSection";
import { RecipeStatsSection } from "components/stats/RecipeStatsSection";

import styles from "./StatsPage.module.scss";

const StatsPage: React.FC = () => {
    useGetAllRecipesQuery(null);
    useGetAllMenusQuery(null);
    const recipeStats = useAppSelector(selectRecipeStatistics);
    const menuStats = useAppSelector(selectMenuStatistics);

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
