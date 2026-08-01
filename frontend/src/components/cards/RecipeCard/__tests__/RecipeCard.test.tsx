import { screen } from "@testing-library/react";

import { RecipeCard } from "components/cards/RecipeCard";

import { renderWithRouter } from "test/router";

const RECIPE = {
    id: 7,
    title: "Slow-roasted ragù",
    type_name: "Main course",
    cooking_time: 85,
    calories_per_portion: null,
};

describe("RecipeCard", () => {
    it("should link to the recipe details page", () => {
        renderWithRouter(<RecipeCard recipe={RECIPE} />);

        expect(
            screen.getByRole("link", { name: /Slow-roasted ragù/ }),
        ).toHaveAttribute("href", "/recipe/7");
    });

    it("should render the recipe type as the chip label", () => {
        renderWithRouter(<RecipeCard recipe={RECIPE} />);

        expect(screen.getByText("Main course")).toBeInTheDocument();
    });

    it("should format the cooking time as hours and minutes", () => {
        renderWithRouter(<RecipeCard recipe={RECIPE} />);

        expect(screen.getByText("1 hr : 25 min")).toBeInTheDocument();
    });

    it("should not show a creation date meta item", () => {
        renderWithRouter(<RecipeCard recipe={RECIPE} />);

        expect(screen.queryByText(/Jan|2026/)).not.toBeInTheDocument();
    });

    it("should mark the card as mine when requested", () => {
        renderWithRouter(<RecipeCard recipe={RECIPE} mine />);

        expect(screen.getByRole("link")).toHaveClass("content-card--mine");
    });

    it("should show the calorie meta item when the recipe has a calorie total", () => {
        renderWithRouter(
            <RecipeCard recipe={{ ...RECIPE, calories_per_portion: 245.6 }} />,
        );

        expect(screen.getByText("246 kcal")).toBeInTheDocument();
    });

    it("should not show a calorie meta item when the recipe has no calorie total", () => {
        renderWithRouter(<RecipeCard recipe={RECIPE} />);

        expect(screen.queryByText(/kcal/)).not.toBeInTheDocument();
    });
});
