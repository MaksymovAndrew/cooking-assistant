import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import NotFoundPage from "app/[locale]/not-found";
import { mockGetByUrl } from "test/apiClientMock";
import { mockNavigate, renderWithProviders } from "test/router";

jest.mock("api/client");

describe("NotFoundPage", () => {
    beforeEach(() => {
        mockGetByUrl({ [API_ROUTES.auth.me]: null });
    });

    it("should render the heading", () => {
        renderWithProviders(<NotFoundPage />);

        expect(
            screen.getByRole("heading", { name: "Page not found" }),
        ).toBeInTheDocument();
    });

    it("should navigate to all recipes when the CTA button is clicked", async () => {
        renderWithProviders(<NotFoundPage />);

        await userEvent.click(
            screen.getByRole("button", { name: /Back to recipes/ }),
        );

        expect(mockNavigate).toHaveBeenCalledWith("/all-recipes");
    });

    it("should render the Recipes, Pantry and Menus links", () => {
        renderWithProviders(<NotFoundPage />);

        const links = within(
            screen.getByRole("navigation", { name: "Page not found" }),
        );

        expect(links.getByRole("link", { name: "Recipes" })).toHaveAttribute(
            "href",
            "/all-recipes",
        );
        expect(links.getByRole("link", { name: "Pantry" })).toHaveAttribute(
            "href",
            "/ingredients",
        );
        expect(links.getByRole("link", { name: "Menus" })).toHaveAttribute(
            "href",
            "/all-menus",
        );
    });
});
