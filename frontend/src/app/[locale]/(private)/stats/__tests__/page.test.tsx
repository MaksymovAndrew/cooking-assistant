import { screen } from "@testing-library/react";

import { ROUTES } from "constants/routes";
import type { MenuStatistics, RecipeStatistics } from "types/stats";

import { API_ROUTES } from "api/endpoints";

import StatsPage from "app/[locale]/(private)/stats/page";
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
const MENU = {
    id: 1,
    title: "Weekday menu",
    categoryName: CATEGORY_NAME,
    recipe_count: 3,
    total_cooking_time: 120,
    total_calories: null,
};
const MENU_STATS: MenuStatistics = {
    menusCount: 1,
    menuCountByCategory: [{ categoryName: CATEGORY_NAME, menuCount: 1 }],
    mostUsedCategory: { categoryName: CATEGORY_NAME, menuCount: 1 },
    averageTotalTime: 120,
    averageRecipesPerMenu: 3,
    averageTotalTimeByCategory: [
        { categoryName: CATEGORY_NAME, averageTotalTime: 120 },
    ],
    fastestMenus: [MENU],
    slowestMenus: [MENU],
    mostRecipesMenus: [MENU],
    leastRecipesMenus: [MENU],
    averageCaloriesOverall: null,
    mostCaloricMenus: [],
    leastCaloricMenus: [],
};

const stubData = () => {
    mockGetByUrl({
        [API_ROUTES.recipes.stats]: RECIPE_STATS,
        [API_ROUTES.menu.stats]: MENU_STATS,
    });
};

describe("StatsPage", () => {
    it("should show the recipe and menu statistics once both load", async () => {
        stubData();

        renderWithRouter(<StatsPage />);

        expect(
            await screen.findByText("Recipe statistics"),
        ).toBeInTheDocument();
        expect(screen.getByText("Menu statistics")).toBeInTheDocument();
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    });

    it("should hold the page's shape while the numbers load", () => {
        mockGetByUrl({});

        renderWithRouter(<StatsPage />);

        expect(
            screen.getByRole("status", { name: "Loading statistics…" }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    });

    it("should offer to add a recipe when there is nothing to count", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.stats]: { ...RECIPE_STATS, recipesCount: 0 },
            [API_ROUTES.menu.stats]: { ...MENU_STATS, menusCount: 0 },
        });

        renderWithRouter(<StatsPage />);

        expect(
            await screen.findByText("No statistics yet"),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Add a recipe" }),
        ).toHaveAttribute("href", ROUTES.addRecipe);
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    });

    it("should show the error state when the menus fail to load", async () => {
        mockGetByUrl({ [API_ROUTES.recipes.stats]: RECIPE_STATS });

        renderWithRouter(<StatsPage />);

        expect(
            await screen.findByText("Error: Error fetching statistics"),
        ).toBeInTheDocument();
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    });
});
