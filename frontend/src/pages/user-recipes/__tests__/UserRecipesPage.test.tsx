import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeListItem } from "types/recipe";
import type { RecipeTypeSummary } from "types/recipeType";

import { API_ROUTES } from "api/endpoints";

import UserRecipesPage from "pages/user-recipes/UserRecipesPage";
import { mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const TITLE = "Borscht";
const SAMPLE: RecipeListItem[] = [
    {
        id: 1,
        title: TITLE,
        type_name: "Soup",
        creation_date: "2024-01-01",
        cooking_time: 60,
    },
];

const SOUP_TYPE: RecipeTypeSummary = {
    id: 1,
    type_name: "Soup",
    description: "Warm dishes",
};

describe("UserRecipesPage", () => {
    it("should render the user's recipes loaded from the api", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.byPerson]: {
                items: SAMPLE,
                total: SAMPLE.length,
            },
            [API_ROUTES.recipeTypes.list]: [],
        });

        renderWithProviders(<UserRecipesPage />, {
            initialEntries: ["/my-recipes"],
        });

        expect(await screen.findByText(TITLE)).toBeInTheDocument();
    });

    it("should record the selected type in the store and show the by-type heading", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.byPerson]: { items: [], total: 0 },
            [API_ROUTES.recipeTypes.list]: [SOUP_TYPE],
        });

        const { store } = renderWithProviders(<UserRecipesPage />, {
            initialEntries: ["/my-recipes"],
        });

        await userEvent.click(screen.getByRole("button", { name: "Filters" }));
        await userEvent.click(screen.getByRole("checkbox"));

        expect(await screen.findByText("Recipes: Soup")).toBeInTheDocument();
        expect(
            screen.getByText("No recipes of this type found."),
        ).toBeInTheDocument();
        expect(store.getState().filters.recipe.selectedTypes).toEqual([1]);
    });
});
