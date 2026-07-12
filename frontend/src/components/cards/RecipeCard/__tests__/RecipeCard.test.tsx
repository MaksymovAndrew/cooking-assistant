import { screen } from "@testing-library/react";

import { RecipeCard } from "components/cards/RecipeCard";

import { renderWithRouter } from "test/router";

const RECIPE = {
    id: 7,
    title: "Slow-roasted ragù",
    type_name: "Main course",
    cooking_time: 85,
    creation_date: "2026-01-15T00:00:00.000Z",
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

    it("should mark the card as mine when requested", () => {
        renderWithRouter(<RecipeCard recipe={RECIPE} mine />);

        expect(screen.getByRole("link")).toHaveClass("content-card--mine");
    });
});
