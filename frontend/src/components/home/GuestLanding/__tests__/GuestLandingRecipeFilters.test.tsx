import { screen } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { GuestLandingRecipeFilters } from "components/home/GuestLanding/GuestLandingRecipeFilters";

import { mockGetByUrl } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const SOUP_TYPE = { id: 3, type_name: "Soup", description: "" };
const ALL_RECIPES_PATH = "/all-recipes";

describe("GuestLandingRecipeFilters", () => {
    it("should link the search button to the full recipe list", () => {
        mockGetByUrl({ [API_ROUTES.recipeTypes.list]: [SOUP_TYPE] });

        renderWithRouter(<GuestLandingRecipeFilters />);

        expect(
            screen.getByRole("link", { name: "Search Recipes" }),
        ).toHaveAttribute("href", ALL_RECIPES_PATH);
    });

    it("should link each fetched recipe type to the list pre-filtered by that type", async () => {
        mockGetByUrl({ [API_ROUTES.recipeTypes.list]: [SOUP_TYPE] });

        renderWithRouter(<GuestLandingRecipeFilters />);

        expect(await screen.findByText("Soup")).toHaveAttribute(
            "href",
            "/all-recipes?types=3",
        );
    });

    it("should link the cooking-time and calories chips to the unfiltered recipe list", () => {
        mockGetByUrl({ [API_ROUTES.recipeTypes.list]: [] });

        renderWithRouter(<GuestLandingRecipeFilters />);

        expect(
            screen.getByRole("link", { name: /Cooking time/ }),
        ).toHaveAttribute("href", ALL_RECIPES_PATH);
        expect(screen.getByRole("link", { name: /Calories/ })).toHaveAttribute(
            "href",
            ALL_RECIPES_PATH,
        );
    });
});
