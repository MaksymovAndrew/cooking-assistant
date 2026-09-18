import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BottomNav } from "components/layout/BottomNav";

import { renderWithProviders, renderWithRouter } from "test/router";
import { makeTestStore } from "test/store";

describe("BottomNav", () => {
    it("should render all 5 tabs in the Shopping, Menus, Recipes, Ingredients, Profile order", () => {
        renderWithRouter(<BottomNav />);

        expect(
            screen.getAllByRole("link").map((link) => link.textContent),
        ).toEqual(["Shopping", "Menus", "Recipes", "Ingredients", "Profile"]);
    });

    it("should mark the tab matching the current route as active", () => {
        renderWithRouter(<BottomNav />, ["/shopping-list"]);

        expect(screen.getByRole("link", { name: /Shopping/ })).toHaveClass(
            "bottom-nav__item--active",
        );
        expect(screen.getByRole("link", { name: /Menus/ })).not.toHaveClass(
            "bottom-nav__item--active",
        );
    });

    it("should render only 3 tabs (Recipes, Menus, Log In) for a guest", () => {
        renderWithProviders(<BottomNav />, {
            store: makeTestStore({ session: { status: "guest" } }),
        });

        expect(
            screen.getAllByRole("link").map((link) => link.textContent),
        ).toEqual(["Recipes", "Menus", "Log In"]);
    });

    it("should record the current page as the login redirect on the guest's Log In tab", async () => {
        renderWithProviders(<BottomNav />, {
            store: makeTestStore({ session: { status: "guest" } }),
            initialEntries: ["/all-recipes"],
        });

        await userEvent.click(screen.getByRole("link", { name: /Log In/ }));

        expect(sessionStorage.getItem("login-redirect")).toBe("/all-recipes");
    });
});
