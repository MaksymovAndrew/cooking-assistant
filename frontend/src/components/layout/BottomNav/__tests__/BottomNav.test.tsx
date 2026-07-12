import { screen } from "@testing-library/react";

import { BottomNav } from "components/layout/BottomNav";

import { renderWithRouter } from "test/router";

describe("BottomNav", () => {
    it("should render all 5 tabs in the Stats, Menus, Recipes, Settings, Profile order", () => {
        renderWithRouter(<BottomNav />);

        expect(
            screen.getAllByRole("link").map((link) => link.textContent),
        ).toEqual(["Stats", "Menus", "Recipes", "Settings", "Profile"]);
    });

    it("should mark the tab matching the current route as active", () => {
        renderWithRouter(<BottomNav />, ["/stats"]);

        expect(screen.getByRole("link", { name: /Stats/ })).toHaveClass(
            "bottom-nav__item--active",
        );
        expect(screen.getByRole("link", { name: /Menus/ })).not.toHaveClass(
            "bottom-nav__item--active",
        );
    });
});
