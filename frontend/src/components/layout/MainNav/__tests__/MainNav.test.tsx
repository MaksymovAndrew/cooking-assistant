import { screen } from "@testing-library/react";

import { MainNav } from "components/layout/MainNav";

import { renderWithProviders, renderWithRouter } from "test/router";
import { makeTestStore } from "test/store";

describe("MainNav", () => {
    it("should label the landmark apart from the tab bar", () => {
        renderWithRouter(<MainNav />);

        expect(
            screen.getByRole("navigation", { name: "Main" }),
        ).toBeInTheDocument();
    });

    it("should render the Recipes, Menus, Ingredients, Shopping and Stats links", () => {
        renderWithRouter(<MainNav />);

        expect(
            screen.getAllByRole("link").map((link) => link.textContent),
        ).toEqual(["Recipes", "Menus", "Ingredients", "Shopping", "Stats"]);
    });

    it("should mark the link matching the current route as the current page", () => {
        renderWithRouter(<MainNav />, ["/ingredients"]);

        expect(
            screen.getByRole("link", { name: /Ingredients/ }),
        ).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("link", { name: /Stats/ })).not.toHaveAttribute(
            "aria-current",
        );
    });

    it("should render only Recipes and Menus for a guest", () => {
        renderWithProviders(<MainNav />, {
            store: makeTestStore({ session: { status: "guest" } }),
        });

        expect(
            screen.getAllByRole("link").map((link) => link.textContent),
        ).toEqual(["Recipes", "Menus"]);
    });
});
