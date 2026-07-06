import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeDetails } from "types/recipe";

import { RecipeHero } from "components/recipes/RecipeHero";

import { renderWithRouter } from "test/router";

const BASE_RECIPE: RecipeDetails = {
    id: 1,
    title: "Slow-roasted ragù",
    content: "A deeply savoury slow-cooked ragù.",
    ingredients: [],
    type_id: 1,
    type_name: "Main course",
    cooking_time: 85,
    creation_date: "2024-01-01",
    servings: "4 servings",
    person_id: 1,
    isOwner: false,
};

describe("RecipeHero", () => {
    it("should render the title, type chip and description", () => {
        renderWithRouter(
            <RecipeHero
                recipe={BASE_RECIPE}
                servingsDisplay="4 servings"
                editTo="/change-recipe/1"
                onDelete={jest.fn()}
            />,
        );

        expect(
            screen.getByRole("heading", { name: "Slow-roasted ragù" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Main course")).toBeInTheDocument();
        expect(
            screen.getByText("A deeply savoury slow-cooked ragù."),
        ).toBeInTheDocument();
    });

    it("should show the given servings display value", () => {
        renderWithRouter(
            <RecipeHero
                recipe={BASE_RECIPE}
                servingsDisplay="8 servings"
                editTo="/change-recipe/1"
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("8 servings")).toBeInTheDocument();
    });

    it("should not show owner actions when the viewer does not own the recipe", () => {
        renderWithRouter(
            <RecipeHero
                recipe={BASE_RECIPE}
                servingsDisplay="4 servings"
                editTo="/change-recipe/1"
                onDelete={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("link", { name: /Edit recipe/ }),
        ).not.toBeInTheDocument();
    });

    it("should show owner actions and call onDelete when the viewer owns the recipe", async () => {
        const onDelete = jest.fn();

        renderWithRouter(
            <RecipeHero
                recipe={{ ...BASE_RECIPE, isOwner: true }}
                servingsDisplay="4 servings"
                editTo="/change-recipe/1"
                onDelete={onDelete}
            />,
        );

        expect(
            screen.getByRole("link", { name: /Edit recipe/ }),
        ).toHaveAttribute("href", "/change-recipe/1");

        await userEvent.click(
            screen.getByRole("button", { name: /Delete recipe/ }),
        );

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("should disable the favourite button since favourites are not wired up yet", () => {
        renderWithRouter(
            <RecipeHero
                recipe={BASE_RECIPE}
                servingsDisplay="4 servings"
                editTo="/change-recipe/1"
                onDelete={jest.fn()}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Favourite" }),
        ).toBeDisabled();
    });
});
