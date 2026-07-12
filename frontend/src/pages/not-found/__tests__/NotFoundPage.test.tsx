import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";

import { API_ROUTES } from "api/endpoints";

import NotFoundPage from "pages/not-found/NotFoundPage";
import { mockGetByUrl } from "test/apiClientMock";
import { mockNavigate, renderWithProviders } from "test/router";

jest.mock("api/client");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

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
            screen.getByRole("button", { name: /Back to Recipes/ }),
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
