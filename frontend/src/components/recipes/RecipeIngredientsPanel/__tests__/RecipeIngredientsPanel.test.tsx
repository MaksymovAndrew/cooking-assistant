import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { IngredientAvailability } from "hooks/useIngredientAvailability";

import { RecipeIngredientsPanel } from "components/recipes/RecipeIngredientsPanel";

import { renderWithRouter } from "test/router";

const TOMATO: IngredientAvailability = {
    id: 1,
    slug: "tomato",
    name: "Tomato",
    category: "vegetables",
    quantity_recipe_ingredients: 2,
    unit_name: "piece",
    allergens: [],
    calories_per_unit: null,
    have: true,
};
const ONION: IngredientAvailability = {
    id: 2,
    slug: "onion",
    name: "Onion",
    category: "vegetables",
    quantity_recipe_ingredients: 1,
    unit_name: "piece",
    allergens: [],
    calories_per_unit: null,
    have: false,
};

const baseProps = {
    availability: [TOMATO, ONION],
    haveCount: 1,
    missingCount: 1,
    isOwner: true,
    portionCount: 1,
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
};

describe("RecipeIngredientsPanel", () => {
    it("should render every ingredient with its quantity and unit", () => {
        renderWithRouter(<RecipeIngredientsPanel {...baseProps} />);

        expect(screen.getByText("Tomato")).toBeInTheDocument();
        expect(screen.getByText("2 piece")).toBeInTheDocument();
        expect(screen.getByText("Onion")).toBeInTheDocument();
        expect(screen.getByText("1 piece")).toBeInTheDocument();
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

    it("should always show the portions stepper", () => {
        renderWithRouter(<RecipeIngredientsPanel {...baseProps} />);

        expect(
            screen.getByRole("button", { name: "More portions" }),
        ).toBeInTheDocument();
    });

    it("should show the scaled quantity and call onIncrement/onDecrement", async () => {
        const onIncrement = jest.fn();
        const onDecrement = jest.fn();

        renderWithRouter(
            <RecipeIngredientsPanel
                {...baseProps}
                portionCount={3}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
            />,
        );

        expect(screen.getByText("6 piece")).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: "More portions" }),
        );
        await userEvent.click(
            screen.getByRole("button", { name: "Fewer portions" }),
        );

        expect(onIncrement).toHaveBeenCalledTimes(1);
        expect(onDecrement).toHaveBeenCalledTimes(1);
    });

    it("should show each ingredient's scaled calorie total", () => {
        renderWithRouter(
            <RecipeIngredientsPanel
                {...baseProps}
                portionCount={2}
                availability={[{ ...TOMATO, calories_per_unit: 20 }]}
            />,
        );

        expect(screen.getByText("80 kcal")).toBeInTheDocument();
    });

    it("should scale a non-integer per-portion calorie value as a clean multiple, not an independently rounded total", () => {
        renderWithRouter(
            <RecipeIngredientsPanel
                {...baseProps}
                portionCount={2}
                availability={[
                    {
                        ...TOMATO,
                        quantity_recipe_ingredients: 1,
                        calories_per_unit: 21.6,
                    },
                ]}
            />,
        );

        // 1 * 21.6 = 21.6, rounds to 22 kcal for one portion - two portions must read
        // 44 (22 * 2), not 43 (round(21.6 * 2) = round(43.2))
        expect(screen.getByText("44 kcal")).toBeInTheDocument();
    });
});
