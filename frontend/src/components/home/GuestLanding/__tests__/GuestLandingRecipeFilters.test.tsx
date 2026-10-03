import { screen } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { GuestLandingRecipeFilters } from "components/home/GuestLanding/GuestLandingRecipeFilters";

import { mockGetByUrl } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const SOUP_TYPE = { id: 3, type_name: "Soup", description: "" };

describe("GuestLandingRecipeFilters", () => {
    it("should link each fetched recipe type to the list pre-filtered by that type", async () => {
        mockGetByUrl({ [API_ROUTES.recipeTypes.list]: [SOUP_TYPE] });

        renderWithRouter(<GuestLandingRecipeFilters />);

        expect(await screen.findByText("Soup")).toHaveAttribute(
            "href",
            "/all-recipes?types=3",
        );
    });
});
