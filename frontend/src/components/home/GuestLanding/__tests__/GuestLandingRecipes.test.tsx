import { screen } from "@testing-library/react";

import type { RecipeSearchResultItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { GuestLandingRecipes } from "components/home/GuestLanding/GuestLandingRecipes";

import { mockedGet, mockGetByUrl } from "test/apiClientMock";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const RECIPE_TITLE = "Slow-roasted ragù";

const SAMPLE_RECIPES = [
    {
        id: 1,
        title: RECIPE_TITLE,
        type_name: "Main course",
        creation_date: "2024-01-01",
        cooking_time: 60,
    },
];

const SERVER_RECIPE: RecipeSearchResultItem = {
    id: 7,
    title: "Borscht",
    language: "en",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 30,
    ingredients: [],
    calories_per_portion: null,
    isOwner: false,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: null,
    containsAvoided: null,
    tags: null,
};

describe("GuestLandingRecipes", () => {
    it("should show the recipes the server brought without asking for them again", () => {
        renderWithRouter(<GuestLandingRecipes recipes={[SERVER_RECIPE]} />);

        expect(screen.getByText("Borscht")).toBeInTheDocument();
        expect(mockedGet).not.toHaveBeenCalled();
    });

    it("should render a card for each fetched recipe and a link to the full list", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.byFilters]: {
                items: SAMPLE_RECIPES,
                total: SAMPLE_RECIPES.length,
            },
        });

        renderWithRouter(<GuestLandingRecipes recipes={null} />);

        expect(await screen.findByText(RECIPE_TITLE)).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /See all recipes/ }),
        ).toHaveAttribute("href", "/all-recipes");
    });

    it("should show an empty state with a Register cta when there are no recipes yet", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.byFilters]: { items: [], total: 0 },
        });

        renderWithRouter(<GuestLandingRecipes recipes={null} />);

        expect(
            await screen.findByText("No recipes published yet"),
        ).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
            "href",
            "/registration",
        );
    });
});
