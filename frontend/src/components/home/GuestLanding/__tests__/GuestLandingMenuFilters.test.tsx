import { screen } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { GuestLandingMenuFilters } from "components/home/GuestLanding/GuestLandingMenuFilters";

import { mockGetByUrl } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const DINNER_CATEGORY = { menu_category_id: 2, category_name: "Dinner" };

describe("GuestLandingMenuFilters", () => {
    it("should link the search button to the full menu list", () => {
        mockGetByUrl({ [API_ROUTES.menuCategories.list]: [DINNER_CATEGORY] });

        renderWithRouter(<GuestLandingMenuFilters />);

        expect(
            screen.getByRole("link", { name: "Search Menus" }),
        ).toHaveAttribute("href", "/all-menus");
    });

    it("should link each fetched category to the list pre-filtered by that category", async () => {
        mockGetByUrl({ [API_ROUTES.menuCategories.list]: [DINNER_CATEGORY] });

        renderWithRouter(<GuestLandingMenuFilters />);

        expect(await screen.findByText("Dinner")).toHaveAttribute(
            "href",
            "/all-menus?cats=2",
        );
    });

    it("should link the All chip to the unfiltered menu list", () => {
        mockGetByUrl({ [API_ROUTES.menuCategories.list]: [] });

        renderWithRouter(<GuestLandingMenuFilters />);

        expect(screen.getByRole("link", { name: "All" })).toHaveAttribute(
            "href",
            "/all-menus",
        );
    });
});
