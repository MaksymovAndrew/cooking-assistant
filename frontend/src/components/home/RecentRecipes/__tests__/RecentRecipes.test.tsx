import { screen } from "@testing-library/react";

import type { RecipeSearchResultItem } from "types/recipe";

import { RecentRecipes } from "components/home/RecentRecipes";

import { renderWithRouter } from "test/router";

const RECIPE: RecipeSearchResultItem = {
    id: 7,
    title: "Borscht",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 30,
    ingredients: [],
    calories_per_portion: null,
};

describe("RecentRecipes", () => {
    it("should render a card for each recipe and a link to all recipes", () => {
        renderWithRouter(
            <RecentRecipes
                recipes={[RECIPE]}
                calorieGoal={null}
                calorieRemaining={null}
            />,
        );

        expect(screen.getByText("Borscht")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "View all →" }),
        ).toHaveAttribute("href", "/my-recipes");
    });

    it("should show an empty message when there are no recent recipes", () => {
        renderWithRouter(
            <RecentRecipes
                recipes={[]}
                calorieGoal={null}
                calorieRemaining={null}
            />,
        );

        expect(
            screen.getByText("No recipes yet - add your first one."),
        ).toBeInTheDocument();
    });

    it("should recolor a card whose calories exceed what's left today", () => {
        renderWithRouter(
            <RecentRecipes
                recipes={[{ ...RECIPE, calories_per_portion: 700 }]}
                calorieGoal={2000}
                calorieRemaining={500}
            />,
        );

        expect(screen.getByText("700 kcal")).toHaveClass(
            "recent-recipe-card__calories--over",
        );
    });

    it("should not recolor a card when there is no calorie goal", () => {
        renderWithRouter(
            <RecentRecipes
                recipes={[{ ...RECIPE, calories_per_portion: 700 }]}
                calorieGoal={null}
                calorieRemaining={null}
            />,
        );

        expect(screen.getByText("700 kcal")).not.toHaveClass(
            "recent-recipe-card__calories--over",
        );
    });
});
