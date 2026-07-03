import { useTranslation } from "react-i18next";

import type { MenuCategoryStat } from "types/stats";

import { LazyPieChart } from "components/stats/LazyPieChart";

interface MenuCategoryChartProps {
    categories: MenuCategoryStat[];
}

export const MenuCategoryChart = ({ categories }: MenuCategoryChartProps) => {
    const { t } = useTranslation("stats");
    const data = categories.map((c) => ({
        name: c.categoryname,
        value: c.menuCount,
    }));

    return <LazyPieChart data={data} centerLabel={t("statsPage.menusLabel")} />;
};
