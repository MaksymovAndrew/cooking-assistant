import { useTranslation } from "react-i18next";

import type { RecipeTypeStat } from "types/stats";

import { LazyPieChart } from "components/stats/LazyPieChart";

interface RecipeTypeChartProps {
    stats: RecipeTypeStat[];
}

export const RecipeTypeChart = ({ stats }: RecipeTypeChartProps) => {
    const { t } = useTranslation("stats");
    const data = stats.map((s) => ({ name: s.typeName, value: s.count }));

    return (
        <LazyPieChart data={data} centerLabel={t("statsPage.recipesLabel")} />
    );
};
