import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeDetails } from "types/recipe";

import { RecipeHero } from "components/recipes/RecipeHero";

import { renderWithRouter } from "test/router";

const LOG_INTAKE_BUTTON = "Log intake";
const CALORIES_PER_PORTION_LABEL = "420 kcal / portion";
const OVER_BUDGET_TOOLTIP = "Exceeds your remaining calories for today";

const BASE_RECIPE: RecipeDetails = {
    id: 1,
    title: "Slow-roasted ragù",
    content: "A deeply savoury slow-cooked ragù.",
    ingredients: [],
    type_id: 1,
    type_name: "Main course",
    cooking_time: 85,
    creation_date: "2024-01-01",
    person_id: 1,
    isOwner: false,
    calories_per_portion: 420,
    calories_override: null,
};

const baseProps = {
    recipe: BASE_RECIPE,
    portionCount: 1,
    editTo: "/change-recipe/1",
    onDelete: jest.fn(),
};

describe("RecipeHero", () => {
    it("should render the title and type chip", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.getByRole("heading", { name: "Slow-roasted ragù" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Main course")).toBeInTheDocument();
    });

    it("should show calories per portion", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.getByText(CALORIES_PER_PORTION_LABEL),
        ).toBeInTheDocument();
    });

    it("should show a total for multiple portions", () => {
        renderWithRouter(<RecipeHero {...baseProps} portionCount={3} />);

        expect(screen.getByText("≈ 1,260 kcal total")).toBeInTheDocument();
    });

    it("should not show a total for a single portion", () => {
        renderWithRouter(<RecipeHero {...baseProps} portionCount={1} />);

        expect(screen.queryByText(/kcal total/)).not.toBeInTheDocument();
    });

    it("should show a placeholder when the recipe has no calorie data", () => {
        renderWithRouter(
            <RecipeHero
                {...baseProps}
                recipe={{ ...BASE_RECIPE, calories_per_portion: null }}
            />,
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("should recolor the calories stat when exceedsBudget is true", () => {
        renderWithRouter(<RecipeHero {...baseProps} exceedsBudget />);

        expect(screen.getByTitle(OVER_BUDGET_TOOLTIP)).toHaveClass(
            "recipe-hero__stat--calorie-over",
        );
    });

    it("should not recolor the calories stat by default", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.queryByTitle(OVER_BUDGET_TOOLTIP),
        ).not.toBeInTheDocument();
    });

    it("should show just the Favourite button and no explanatory text for a visitor", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.queryByRole("link", { name: /Edit recipe/ }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(/Viewing someone else's recipe/),
        ).not.toBeInTheDocument();
        expect(
            screen.getAllByRole("button", { name: "Favourite" })[1],
        ).toBeInTheDocument();
    });

    it("should not show the rating stat for a visitor", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(screen.queryByText("Your rating")).not.toBeInTheDocument();
    });

    it("should show owner actions, the rating stat and call onDelete when the viewer owns the recipe", async () => {
        const onDelete = jest.fn();

        renderWithRouter(
            <RecipeHero
                {...baseProps}
                recipe={{ ...BASE_RECIPE, isOwner: true }}
                onDelete={onDelete}
            />,
        );

        expect(
            screen.getByRole("link", { name: /Edit recipe/ }),
        ).toHaveAttribute("href", "/change-recipe/1");
        expect(screen.getByText("Your rating")).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: /Delete recipe/ }),
        );

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("should disable the favourite button since favourites are not wired up yet", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.getAllByRole("button", { name: "Favourite" })[0],
        ).toBeDisabled();
    });

    it("should show the log-intake button and call onLogIntake when calories are available", async () => {
        const onLogIntake = jest.fn();

        renderWithRouter(
            <RecipeHero {...baseProps} onLogIntake={onLogIntake} />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_BUTTON }),
        );

        expect(onLogIntake).toHaveBeenCalledTimes(1);
    });

    it("should not show the log-intake button when onLogIntake is not provided", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.queryByRole("button", { name: LOG_INTAKE_BUTTON }),
        ).not.toBeInTheDocument();
    });

    it("should show the log-intake button in the owner actions row and call onLogIntake", async () => {
        const onLogIntake = jest.fn();

        renderWithRouter(
            <RecipeHero
                {...baseProps}
                recipe={{ ...BASE_RECIPE, isOwner: true }}
                onLogIntake={onLogIntake}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_BUTTON }),
        );

        expect(onLogIntake).toHaveBeenCalledTimes(1);
    });
});
