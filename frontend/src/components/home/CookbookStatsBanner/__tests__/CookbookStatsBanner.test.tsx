import { screen } from "@testing-library/react";

import { ROUTES } from "constants/routes";

import { CookbookStatsBanner } from "components/home/CookbookStatsBanner";

import { renderWithRouter } from "test/router";

describe("CookbookStatsBanner", () => {
    it("should link to the stats page", () => {
        renderWithRouter(<CookbookStatsBanner />);

        expect(
            screen.getByRole("link", { name: "Open stats" }),
        ).toHaveAttribute("href", ROUTES.stats);
    });

    it("should say the numbers cover every recipe, not the viewer's own", () => {
        renderWithRouter(<CookbookStatsBanner />);

        expect(screen.getByText("Cookbook stats")).toBeInTheDocument();
        expect(
            screen.getByText(/across every recipe here/),
        ).toBeInTheDocument();
    });
});
