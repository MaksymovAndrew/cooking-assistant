import { screen } from "@testing-library/react";

import { MainNav } from "components/layout/MainNav";

import { renderWithProviders, renderWithRouter } from "test/router";
import { makeTestStore } from "test/store";

describe("MainNav", () => {
    it("should render the Recipes, Menus, Ingredients and Stats links", () => {
        renderWithRouter(<MainNav />);

        expect(
            screen.getAllByRole("link").map((link) => link.textContent),
        ).toEqual(["Recipes", "Menus", "Ingredients", "Stats"]);
    });

    it("should mark the link matching the current route as active", () => {
        renderWithRouter(<MainNav />, ["/ingredients"]);

        expect(screen.getByRole("link", { name: /Ingredients/ })).toHaveClass(
            "main-nav__item--active",
        );
        expect(screen.getByRole("link", { name: /Stats/ })).not.toHaveClass(
            "main-nav__item--active",
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
