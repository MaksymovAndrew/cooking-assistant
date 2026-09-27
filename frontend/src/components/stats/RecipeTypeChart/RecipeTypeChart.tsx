import { useTranslation } from "react-i18next";

import type { RecipeTypeStat } from "types/stats";

import { LazyPieChart } from "components/stats/LazyPieChart";

import { recipeTypeName } from "utils/referenceLabels";

interface RecipeTypeChartProps {
    stats: RecipeTypeStat[];
}

export const RecipeTypeChart = ({ stats }: RecipeTypeChartProps) => {
    const { t } = useTranslation("stats");
    const data = stats.map((s) => ({
        name: recipeTypeName(t, s.typeName),
        value: s.count,
    }));
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <LazyPieChart
            data={data}
            centerLabel={t("statsPage.recipesLabel", { count: total })}
        />
    );
};
