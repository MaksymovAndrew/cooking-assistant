import { useTranslation } from "react-i18next";

import type { RecipeTypeBucket } from "types/stats";

import { LazyPieChart } from "components/stats/LazyPieChart";
import { NEUTRAL_CHART_COLOR } from "components/stats/PieChartCard/chartColors";

import { recipeTypeName } from "utils/referenceLabels";
import { sumBy } from "utils/sum";

interface RecipeTypeChartProps {
    stats: RecipeTypeBucket[];
}

export const RecipeTypeChart = ({ stats }: RecipeTypeChartProps) => {
    const { t } = useTranslation("stats");
    const data = stats.map(({ typeName, count }) =>
        typeName === null
            ? {
                  name: t("statsPage.untypedRecipesLabel"),
                  value: count,
                  color: NEUTRAL_CHART_COLOR,
              }
            : { name: recipeTypeName(t, typeName), value: count },
    );
    const total = sumBy(data, (entry) => entry.value);

    return (
        <LazyPieChart
            data={data}
            centerLabel={t("statsPage.recipesLabel", { count: total })}
        />
    );
};
