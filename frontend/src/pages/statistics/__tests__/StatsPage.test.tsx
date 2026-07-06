import { screen } from "@testing-library/react";

import type { Menu } from "types/menu";
import type { RecipeWithIngredientNames } from "types/recipe";

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
const SAMPLE_RECIPES: RecipeWithIngredientNames[] = [
    {
        id: 1,
        title: "Borscht",
        type_name: TYPE_NAME,
        creation_date: "2024-01-01",
        cooking_time: 60,
        ingredients: ["beet"],
    },
];
const SAMPLE_MENUS: Menu[] = [
    {
        id: 1,
        title: "Weekday menu",
        categoryname: CATEGORY_NAME,
        menucontent: "",
    },
];

const stubData = () => {
    mockGetByUrl({
        [API_ROUTES.recipes.list]: SAMPLE_RECIPES,
        [API_ROUTES.menu.allUnpaginated]: SAMPLE_MENUS,
    });
};

describe("StatsPage", () => {
    it("should render both section headings", () => {
        stubData();

        renderWithRouter(<StatsPage />);

        expect(screen.getByText("Recipe Statistics")).toBeInTheDocument();
        expect(screen.getByText("Menu Statistics")).toBeInTheDocument();
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
        expect(screen.getByText("Total menus")).toBeInTheDocument();
    });
});
