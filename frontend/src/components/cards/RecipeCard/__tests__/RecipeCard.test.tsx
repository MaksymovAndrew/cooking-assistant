import { screen } from "@testing-library/react";

import { RecipeCard } from "components/cards/RecipeCard";

import { renderWithProviders, renderWithRouter } from "test/router";
import { makeTestStore } from "test/store";

const RECIPE = {
    id: 7,
    title: "Slow-roasted ragù",
    type_name: "Main course",
    cooking_time: 85,
    calories_per_portion: null,
};

const CALORIES_OVER_BUDGET = 700;
const CALORIES_OVER_BUDGET_LABEL = `${CALORIES_OVER_BUDGET} kcal`;
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

    it("should recolor the calorie border and meta item when exceedsBudget is true", () => {
        renderWithRouter(
            <RecipeCard recipe={RECIPE_OVER_BUDGET} exceedsBudget />,
        );

        expect(screen.getByRole("link")).toHaveClass(
            "content-card--calorie-over",
        );
        expect(screen.getByText(CALORIES_OVER_BUDGET_LABEL)).toHaveClass(
            "content-card__meta-item--calorie-over",
        );
    });

    it("should not recolor the calorie meta item by default", () => {
        renderWithRouter(<RecipeCard recipe={RECIPE_OVER_BUDGET} />);

        expect(screen.getByRole("link")).not.toHaveClass(
            "content-card--calorie-over",
        );
        expect(screen.getByText(CALORIES_OVER_BUDGET_LABEL)).not.toHaveClass(
            "content-card__meta-item--calorie-over",
        );
    });

    it("should show the favourite button for an authed viewer", () => {
        renderWithProviders(<RecipeCard recipe={RECIPE} />, {
            store: makeTestStore({ session: { status: "authed" } }),
        });

        expect(
            screen.getByRole("button", { name: "Favourite" }),
        ).toBeInTheDocument();
    });

    it("should hide the favourite button for a guest", () => {
        renderWithProviders(<RecipeCard recipe={RECIPE} />, {
            store: makeTestStore({ session: { status: "guest" } }),
        });

        expect(
            screen.queryByRole("button", { name: "Favourite" }),
        ).not.toBeInTheDocument();
    });
});
