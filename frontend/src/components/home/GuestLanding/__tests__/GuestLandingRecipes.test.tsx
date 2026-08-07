import { screen } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { GuestLandingRecipes } from "components/home/GuestLanding/GuestLandingRecipes";

import { mockGetByUrl } from "test/apiClientMock";
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

describe("GuestLandingRecipes", () => {
    it("should render a card for each fetched recipe and a link to the full list", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.byFilters]: {
                items: SAMPLE_RECIPES,
                total: SAMPLE_RECIPES.length,
            },
        });

        renderWithRouter(<GuestLandingRecipes />);

        expect(await screen.findByText(RECIPE_TITLE)).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /See all recipes/ }),
        ).toHaveAttribute("href", "/all-recipes");
    });

    it("should show an empty state with a Register cta when there are no recipes yet", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.byFilters]: { items: [], total: 0 },
        });

        renderWithRouter(<GuestLandingRecipes />);

        expect(
            await screen.findByText("No recipes published yet"),
        ).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
            "href",
            "/registration",
        );
    });
});
