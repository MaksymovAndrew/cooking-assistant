import { screen } from "@testing-library/react";

import { RecipeCard } from "components/cards/RecipeCard";

import { renderWithRouter } from "test/router";

const TYPE_NAME = "Main course";

const RECIPE = {
    id: 7,
    title: "Slow-roasted ragù",
    type_name: TYPE_NAME,
    cooking_time: 85,
    calories_per_portion: null,
};

const CALORIES_OVER_BUDGET = 700;
const CALORIES_OVER_BUDGET_LABEL = `${CALORIES_OVER_BUDGET} kcal`;
const OVER_BUDGET_TOOLTIP = "Exceeds your remaining calories for today";
const ALLERGENS_TOOLTIP = "Contains allergens";
const RECIPE_OVER_BUDGET = {
    ...RECIPE,
    calories_per_portion: CALORIES_OVER_BUDGET,
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

        expect(screen.getByText(TYPE_NAME)).toBeInTheDocument();
    });

    it("should render a recipe without a type and no chip for it", () => {
        renderWithRouter(
            <RecipeCard recipe={{ ...RECIPE, type_name: null }} />,
        );

        expect(screen.getByText(RECIPE.title)).toBeInTheDocument();
        expect(screen.queryByText(TYPE_NAME)).not.toBeInTheDocument();
    });

    it("should format the cooking time as hours and minutes", () => {
        renderWithRouter(<RecipeCard recipe={RECIPE} />);

        expect(screen.getByText("1 hr : 25 min")).toBeInTheDocument();
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

    it("should explain the calories are over budget when exceedsBudget is true", () => {
        renderWithRouter(
            <RecipeCard recipe={RECIPE_OVER_BUDGET} exceedsBudget />,
        );

        expect(screen.getByTitle(OVER_BUDGET_TOOLTIP)).toHaveTextContent(
            CALORIES_OVER_BUDGET_LABEL,
        );
    });

    it("should not flag the calories as over budget by default", () => {
        renderWithRouter(<RecipeCard recipe={RECIPE_OVER_BUDGET} />);

        expect(
            screen.getByText(CALORIES_OVER_BUDGET_LABEL),
        ).toBeInTheDocument();
        expect(
            screen.queryByTitle(OVER_BUDGET_TOOLTIP),
        ).not.toBeInTheDocument();
    });

    it("should warn that a recipe contains allergens, and nothing when it has none", () => {
        const { unmount } = renderWithRouter(
            <RecipeCard
                recipe={{ ...RECIPE, ingredients: [{ allergens: ["milk"] }] }}
            />,
        );

        expect(screen.getByTitle(ALLERGENS_TOOLTIP)).toBeInTheDocument();

        unmount();
        renderWithRouter(
            <RecipeCard
                recipe={{ ...RECIPE, ingredients: [{ allergens: [] }] }}
            />,
        );

        expect(screen.queryByTitle(ALLERGENS_TOOLTIP)).not.toBeInTheDocument();
    });

    it("should show a heart when the server sent a favourite flag", () => {
        renderWithRouter(
            <RecipeCard recipe={{ ...RECIPE, isFavourite: false }} />,
        );

        expect(
            screen.getByRole("button", { name: "Favourite" }),
        ).toHaveAttribute("aria-pressed", "false");
    });

    it("should hide the heart for an anonymous viewer", () => {
        renderWithRouter(
            <RecipeCard recipe={{ ...RECIPE, isFavourite: null }} />,
        );

        expect(
            screen.queryByRole("button", { name: "Favourite" }),
        ).not.toBeInTheDocument();
    });

    it("should mark a recipe the viewer avoids, and nothing for a guest", () => {
        const { unmount } = renderWithRouter(
            <RecipeCard recipe={{ ...RECIPE, containsAvoided: true }} />,
        );

        expect(screen.getByText("Avoid")).toBeInTheDocument();

        unmount();
        renderWithRouter(
            <RecipeCard recipe={{ ...RECIPE, containsAvoided: null }} />,
        );

        expect(screen.queryByText("Avoid")).not.toBeInTheDocument();
    });
});
