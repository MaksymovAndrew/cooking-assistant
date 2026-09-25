import { useTranslation } from "react-i18next";

import type { MenuCategoryStat } from "types/stats";

import { LazyPieChart } from "components/stats/LazyPieChart";

import { menuCategoryName } from "utils/referenceLabels";

interface MenuCategoryChartProps {
    categories: MenuCategoryStat[];
}

export const MenuCategoryChart = ({ categories }: MenuCategoryChartProps) => {
    const { t } = useTranslation("stats");
    const data = categories.map((c) => ({
        name: menuCategoryName(t, c.categoryname),
        value: c.menuCount,
    }));
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <LazyPieChart
            data={data}
            centerLabel={t("statsPage.menusLabel", { count: total })}
        />
    );
};
