import { screen } from "@testing-library/react";

import type { RecipeListItem } from "types/recipe";

import { RecentRecipes } from "components/home/RecentRecipes";

import { renderWithRouter } from "test/router";

const RECIPE: RecipeListItem = {
    id: 7,
    title: "Borscht",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 30,
};

describe("RecentRecipes", () => {
    it("should render a card for each recipe and a link to all recipes", () => {
        renderWithRouter(<RecentRecipes recipes={[RECIPE]} />);

        expect(screen.getByText("Borscht")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "View all →" }),
        ).toHaveAttribute("href", "/my-recipes");
    });

    it("should show an empty message when there are no recent recipes", () => {
        renderWithRouter(<RecentRecipes recipes={[]} />);

        expect(
            screen.getByText("No recipes yet - add your first one."),
        ).toBeInTheDocument();
    });
});
