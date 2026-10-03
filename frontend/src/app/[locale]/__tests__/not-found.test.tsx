import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import NotFoundPage from "app/[locale]/not-found";
import { mockGetByUrl } from "test/apiClientMock";
import { mockNavigate, renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const PAGE_NOT_FOUND = "Page not found";
const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    avatar_photo_key: null,
    calorie_goal: null,
    locale: "en",
};

describe("NotFoundPage", () => {
    beforeEach(() => {
        mockGetByUrl({ [API_ROUTES.auth.me]: null });
    });

    it("should navigate to all recipes when the CTA button is clicked", async () => {
        renderWithProviders(<NotFoundPage />);

        await userEvent.click(
            screen.getByRole("button", { name: /Back to recipes/ }),
        );

        expect(mockNavigate).toHaveBeenCalledWith("/all-recipes");
    });

    it("should point a signed-in visitor at the recipes, their pantry and the menus", () => {
        mockGetByUrl({ [API_ROUTES.auth.me]: CURRENT_USER });
        renderWithProviders(<NotFoundPage />, {
            store: makeTestStore({ session: { status: "authed" } }),
        });

        const links = within(
            screen.getByRole("navigation", { name: PAGE_NOT_FOUND }),
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

    it("should point a guest at the home page instead of the pantry", async () => {
        renderWithProviders(<NotFoundPage />);

        const links = within(
            screen.getByRole("navigation", { name: PAGE_NOT_FOUND }),
        );

        expect(
            await links.findByRole("link", { name: "Home" }),
        ).toHaveAttribute("href", "/");
        expect(
            links.queryByRole("link", { name: "Pantry" }),
        ).not.toBeInTheDocument();
    });
});
