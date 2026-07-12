import { screen } from "@testing-library/react";

import type { RecipeListItem } from "types/recipe";

import { RecentRecipeCard } from "components/home/RecentRecipes/RecentRecipeCard";

import { renderWithRouter } from "test/router";

const RECIPE: RecipeListItem = {
    id: 7,
    title: "Borscht",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 90,
};

describe("RecentRecipeCard", () => {
    it("should link to the recipe details page", () => {
        renderWithRouter(<RecentRecipeCard recipe={RECIPE} />);

        expect(screen.getByRole("link")).toHaveAttribute("href", "/recipe/7");
        expect(screen.getByText("Borscht")).toBeInTheDocument();
    });

    it("should show hours and minutes when the cooking time is an hour or more", () => {
        renderWithRouter(<RecentRecipeCard recipe={RECIPE} />);

        expect(screen.getByText("1h 30m")).toBeInTheDocument();
    });

    it("should show only minutes when the cooking time is under an hour", () => {
        renderWithRouter(
            <RecentRecipeCard recipe={{ ...RECIPE, cooking_time: 45 }} />,
        );

        expect(screen.getByText("45m")).toBeInTheDocument();
    });
});
