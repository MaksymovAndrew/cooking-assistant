import { render, screen } from "@testing-library/react";

import type { MenuWithStats } from "types/menu";
import type { MenuStatistics } from "types/stats";

import { MenuStatsSection } from "components/stats/MenuStatsSection";

const MENU: MenuWithStats = {
    id: 1,
    title: "Sunday dinners",
    categoryname: "Lunch",
    menucontent: "",
    recipe_count: 4,
    total_cooking_time: 90,
};

const STATS: MenuStatistics = {
    menusCount: 3,
    menuCountByCategory: [{ categoryname: "Lunch", menuCount: 2 }],
    mostUsedCategory: { categoryname: "Lunch", menuCount: 2 },
    averageTotalTime: 90,
    averageRecipesPerMenu: 4,
    averageTotalTimeByCategory: [
        { categoryname: "Lunch", averageTotalTime: 90 },
    ],
    fastestMenus: [MENU],
    slowestMenus: [MENU],
    mostRecipesMenus: [MENU],
    leastRecipesMenus: [MENU],
};

describe("MenuStatsSection", () => {
    it("should render the quick-stat tiles", () => {
        render(<MenuStatsSection stats={STATS} />);

        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getAllByText("1h 30m").length).toBeGreaterThan(0);
        expect(screen.getByText("4.0")).toBeInTheDocument();
        expect(screen.getAllByText("Lunch").length).toBeGreaterThan(0);
        expect(screen.getByText("2 of 3 menus")).toBeInTheDocument();
    });

    it("should show a placeholder tile when there is no most-used category", () => {
        render(
            <MenuStatsSection
                stats={{ ...STATS, mostUsedCategory: null, menusCount: 0 }}
            />,
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("should render the menu extremes", () => {
        render(<MenuStatsSection stats={STATS} />);

        expect(screen.getAllByText("Sunday dinners").length).toBeGreaterThan(0);
    });
});
