import { useTranslation } from "react-i18next";

import type { MenuCategoryStat } from "types/stats";

import { LazyPieChart } from "components/stats/LazyPieChart";

import { menuCategoryName } from "utils/referenceLabels";
import { sumBy } from "utils/sum";

interface MenuCategoryChartProps {
    categories: MenuCategoryStat[];
}

export const MenuCategoryChart = ({ categories }: MenuCategoryChartProps) => {
    const { t } = useTranslation("stats");
    const data = categories.map((c) => ({
        name: menuCategoryName(t, c.categoryName),
        value: c.menuCount,
    }));
    const total = sumBy(data, (entry) => entry.value);

    return (
        <LazyPieChart
            data={data}
            centerLabel={t("statsPage.menusLabel", { count: total })}
        />
    );
};
