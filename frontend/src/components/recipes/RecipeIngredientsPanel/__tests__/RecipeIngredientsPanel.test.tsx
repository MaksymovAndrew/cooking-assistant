import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { IngredientAvailability } from "hooks/useIngredientAvailability";

import { RecipeIngredientsPanel } from "components/recipes/RecipeIngredientsPanel";

import { renderWithRouter } from "test/router";

const TOMATO: IngredientAvailability = {
    id: 1,
    name: "Tomato",
    quantity_recipe_ingredients: 2,
    unit_name: "pcs",
    allergens: null,
    have: true,
};
const ONION: IngredientAvailability = {
    id: 2,
    name: "Onion",
    quantity_recipe_ingredients: 1,
    unit_name: "pcs",
    allergens: null,
    have: false,
};

const baseProps = {
    availability: [TOMATO, ONION],
    haveCount: 1,
    missingCount: 1,
    isOwner: true,
    canScale: false,
    servingsCount: null,
    scaleFactor: 1,
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
};

describe("RecipeIngredientsPanel", () => {
    it("should render every ingredient with its quantity and unit", () => {
        renderWithRouter(<RecipeIngredientsPanel {...baseProps} />);

        expect(screen.getByText("Tomato")).toBeInTheDocument();
        expect(screen.getByText("2 pcs")).toBeInTheDocument();
        expect(screen.getByText("Onion")).toBeInTheDocument();
        expect(screen.getByText("1 pcs")).toBeInTheDocument();
    });

    it("should show the have/missing summary banner and a pantry link for the owner", () => {
        renderWithRouter(<RecipeIngredientsPanel {...baseProps} />);

        expect(
            screen.getByText(/You have 1 of 2 — 1 to buy\./),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Check pantry →" }),
        ).toBeInTheDocument();
    });

    it("should show the pantry-link banner for a visitor", () => {
        renderWithRouter(
            <RecipeIngredientsPanel {...baseProps} isOwner={false} />,
        );

        expect(
            screen.getByText(/You have 1 of 2 ingredients\./),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Check pantry →" }),
        ).toBeInTheDocument();
    });

    it("should not show the banner when nothing is missing", () => {
        renderWithRouter(
            <RecipeIngredientsPanel
                {...baseProps}
                missingCount={0}
                availability={[TOMATO]}
            />,
        );

        expect(
            screen.queryByText(
                (_, element) =>
                    element?.textContent === "You have 1 of 1 — 0 to buy.",
            ),
        ).not.toBeInTheDocument();
    });

    it("should not show the portions stepper when the recipe can't be scaled", () => {
        renderWithRouter(<RecipeIngredientsPanel {...baseProps} />);

        expect(
            screen.queryByRole("button", { name: "More portions" }),
        ).not.toBeInTheDocument();
    });

    it("should show the scaled quantity and call onIncrement/onDecrement when scaling is available", async () => {
        const onIncrement = jest.fn();
        const onDecrement = jest.fn();

        renderWithRouter(
            <RecipeIngredientsPanel
                {...baseProps}
                canScale
                servingsCount={4}
                scaleFactor={1.5}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
            />,
        );

        expect(screen.getByText("3 pcs")).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: "More portions" }),
        );
        await userEvent.click(
            screen.getByRole("button", { name: "Fewer portions" }),
        );

        expect(onIncrement).toHaveBeenCalledTimes(1);
        expect(onDecrement).toHaveBeenCalledTimes(1);
    });
});
