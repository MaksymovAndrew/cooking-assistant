import { screen } from "@testing-library/react";

import { menuDetailsPath } from "constants/routes";
import type {
    MenuStatistics,
    MenuStatsEntry,
    MenuWithCalories,
} from "types/stats";

import { MenuStatsSection } from "components/stats/MenuStatsSection";

import { renderWithRouter } from "test/router";

const MENU_ID = 1;
const MENU: MenuStatsEntry = {
    id: MENU_ID,
    title: "Sunday dinners",
    categoryName: "Lunch",
    recipe_count: 4,
    total_cooking_time: 90,
    total_calories: 1200,
};
const CALORIE_MENU: MenuWithCalories = { ...MENU, total_calories: 1200 };

const STATS: MenuStatistics = {
    menusCount: 3,
    menuCountByCategory: [{ categoryName: "Lunch", menuCount: 2 }],
    mostUsedCategory: { categoryName: "Lunch", menuCount: 2 },
    averageTotalTime: 90,
    averageRecipesPerMenu: 4,
    averageTotalTimeByCategory: [
        { categoryName: "Lunch", averageTotalTime: 90 },
    ],
    fastestMenus: [MENU],
    slowestMenus: [MENU],
    mostRecipesMenus: [MENU],
    leastRecipesMenus: [MENU],
    averageCaloriesOverall: 1200,
    mostCaloricMenus: [CALORIE_MENU],
    leastCaloricMenus: [CALORIE_MENU],
};

describe("MenuStatsSection", () => {
    it("should render the quick-stat tiles", () => {
        renderWithRouter(<MenuStatsSection stats={STATS} />);

        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getAllByText("1h 30m").length).toBeGreaterThan(0);
        expect(screen.getByText("4.0")).toBeInTheDocument();
        expect(screen.getAllByText("Lunch").length).toBeGreaterThan(0);
        expect(screen.getByText("2 of 3 menus")).toBeInTheDocument();
        expect(screen.getByText("1,200 kcal")).toBeInTheDocument();
    });

    it("should show a placeholder tile when there is no most-used category", () => {
        renderWithRouter(
            <MenuStatsSection
                stats={{ ...STATS, mostUsedCategory: null, menusCount: 0 }}
            />,
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("should show a placeholder tile when there is no calorie data", () => {
        renderWithRouter(
            <MenuStatsSection
                stats={{
                    ...STATS,
                    averageCaloriesOverall: null,
                    mostCaloricMenus: [],
                    leastCaloricMenus: [],
                }}
            />,
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("should link each extreme menu to its own detail page", () => {
        renderWithRouter(<MenuStatsSection stats={STATS} />);

        const links = screen.getAllByRole("link", { name: /Sunday dinners/ });

        expect(links.length).toBeGreaterThan(0);
        links.forEach((link) => {
            expect(link).toHaveAttribute("href", menuDetailsPath(MENU_ID));
        });
    });

    it("should abbreviate the calorie extremes list, but not the avg-calories tile", () => {
        renderWithRouter(
            <MenuStatsSection
                stats={{
                    ...STATS,
                    mostCaloricMenus: [
                        { ...CALORIE_MENU, total_calories: 13_333 },
                    ],
                    leastCaloricMenus: [
                        { ...CALORIE_MENU, total_calories: 13_333 },
                    ],
                }}
            />,
        );

        expect(screen.getAllByText("13k kcal").length).toBeGreaterThan(0);
        expect(screen.getByText("1,200 kcal")).toBeInTheDocument();
    });
});
