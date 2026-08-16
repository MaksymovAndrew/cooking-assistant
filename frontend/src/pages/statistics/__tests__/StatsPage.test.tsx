import { screen } from "@testing-library/react";

import type { MenuWithStats } from "types/menu";
import type { RecipeStatistics } from "types/stats";

import { API_ROUTES } from "api/endpoints";

import StatsPage from "pages/statistics/StatsPage";
import { mockGetByUrl } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

// recharts cannot fully render under jsdom (SVG/ResizeObserver), so it is stubbed out
jest.mock("components/stats/PieChartCard/PieChartCard", () => ({
    __esModule: true,
    default: () => null,
}));

const TYPE_NAME = "Soup";
const CATEGORY_NAME = "Lunch";
const RECIPE_STATS: RecipeStatistics = {
    stats: [{ typeName: TYPE_NAME, count: 1 }],
    recipesCount: 1,
    averageCookingTimeOverall: 60,
    averageCookingTimesByType: [
        { typeName: TYPE_NAME, averageCookingTime: 60 },
    ],
    mostUsedType: { typeName: TYPE_NAME, count: 1 },
    fastestRecipes: [{ id: 1, title: "Borscht", cookingTime: 60 }],
    slowestRecipes: [{ id: 1, title: "Borscht", cookingTime: 60 }],
    mostIngredientsRecipes: [{ id: 1, title: "Borscht", ingredientCount: 1 }],
    leastIngredientsRecipes: [{ id: 1, title: "Borscht", ingredientCount: 1 }],
    averageCaloriesOverall: null,
    mostCaloricRecipes: [],
    leastCaloricRecipes: [],
};
const SAMPLE_MENUS: MenuWithStats[] = [
    {
        id: 1,
        title: "Weekday menu",
        categoryname: CATEGORY_NAME,
        menucontent: "",
        recipe_count: 3,
        total_cooking_time: 120,
        total_calories: null,
    },
];

const stubData = () => {
    mockGetByUrl({
        [API_ROUTES.recipes.stats]: RECIPE_STATS,
        [API_ROUTES.menu.allUnpaginated]: SAMPLE_MENUS,
    });
};

describe("StatsPage", () => {
    it("should render both section headings", async () => {
        stubData();

        renderWithRouter(<StatsPage />);

        expect(
            await screen.findByText("Recipe statistics"),
        ).toBeInTheDocument();
        expect(screen.getByText("Menu statistics")).toBeInTheDocument();
    });

    it("should render the recipe quick-stat tiles", async () => {
        stubData();

        renderWithRouter(<StatsPage />);

        expect((await screen.findAllByText(TYPE_NAME)).length).toBeGreaterThan(
            0,
        );
        expect(screen.getByText("Total recipes")).toBeInTheDocument();
    });

    it("should render the menu quick-stat tiles", async () => {
        stubData();

        renderWithRouter(<StatsPage />);

        expect(
            (await screen.findAllByText(CATEGORY_NAME)).length,
        ).toBeGreaterThan(0);
        expect(screen.getAllByText("Total menus").length).toBeGreaterThan(0);
    });
});
