import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BottomNav } from "components/layout/BottomNav";

import { renderWithProviders, renderWithRouter } from "test/router";
import { makeTestStore } from "test/store";

describe("BottomNav", () => {
    it("should label the landmark apart from the header navigation", () => {
        renderWithRouter(<BottomNav />);

        expect(
            screen.getByRole("navigation", { name: "Tab bar" }),
        ).toBeInTheDocument();
    });

    it("should render all 5 tabs in the Shopping, Menus, Recipes, Ingredients, Profile order", () => {
        renderWithRouter(<BottomNav />);

        expect(
            screen.getAllByRole("link").map((link) => link.textContent),
        ).toEqual(["Shopping", "Menus", "Recipes", "Ingredients", "Profile"]);
    });

    it("should mark the tab matching the current route as the current page", () => {
        renderWithRouter(<BottomNav />, ["/shopping-list"]);

        expect(screen.getByRole("link", { name: /Shopping/ })).toHaveAttribute(
            "aria-current",
            "page",
        );
        expect(screen.getByRole("link", { name: /Menus/ })).not.toHaveAttribute(
            "aria-current",
        );
    });

    it("should render only 3 tabs (Recipes, Menus, Log In) for a guest", () => {
        renderWithProviders(<BottomNav />, {
            store: makeTestStore({ session: { status: "guest" } }),
        });

        expect(
            screen.getAllByRole("link").map((link) => link.textContent),
        ).toEqual(["Recipes", "Menus", "Log in"]);
    });

    it("should record the current page as the login redirect on the guest's Log In tab", async () => {
        renderWithProviders(<BottomNav />, {
            store: makeTestStore({ session: { status: "guest" } }),
            initialEntries: ["/all-recipes"],
        });

        await userEvent.click(screen.getByRole("link", { name: /Log in/ }));

        expect(sessionStorage.getItem("login-redirect")).toBe("/all-recipes");
    });
});
