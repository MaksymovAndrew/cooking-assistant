import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import MainPage from "pages/recipes/MainPage";
import { mockGetByUrl } from "test/apiClientMock";
import { ROUTE_ALL_RECIPES } from "test/constants";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const RECIPE_TITLE_1 = "Borscht";
const RECIPE_TITLE_2 = "Varenyky";

const TYPE_ID = 1;
const TYPE_NAME = "Soup";
const SAMPLE_TYPES = [{ id: TYPE_ID, type_name: TYPE_NAME, description: "" }];

const SAMPLE_RECIPES = [
    {
        id: 1,
        title: RECIPE_TITLE_1,
        type_name: "Soup",
        creation_date: "2024-01-01",
        cooking_time: 60,
    },
    {
        id: 2,
        title: RECIPE_TITLE_2,
        type_name: "Main",
        creation_date: "2024-01-02",
        cooking_time: 45,
    },
];

describe("MainPage", () => {
    it("should render recipe titles returned by the api", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.byFilters]: {
                items: SAMPLE_RECIPES,
                total: SAMPLE_RECIPES.length,
            },
            [API_ROUTES.recipeTypes.list]: [],
        });

        renderWithProviders(<MainPage />, {
            initialEntries: [ROUTE_ALL_RECIPES],
        });

        expect(await screen.findByText(RECIPE_TITLE_1)).toBeInTheDocument();
        expect(screen.getByText(RECIPE_TITLE_2)).toBeInTheDocument();
    });

    it("should filter by the selected type and show the filtered heading", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.byFilters]: { items: [], total: 0 },
            [API_ROUTES.recipeTypes.list]: SAMPLE_TYPES,
        });

        renderWithProviders(<MainPage />, {
            initialEntries: [ROUTE_ALL_RECIPES],
        });

        await userEvent.click(
            await screen.findByRole("button", { name: "Filters" }),
        );
        await userEvent.click(screen.getByRole("checkbox"));

        expect(
            await screen.findByText(`Recipes: ${TYPE_NAME}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText("No recipes match your search"),
        ).toBeInTheDocument();
    });
});
