import { screen } from "@testing-library/react";

import { RecipeOwnerActions } from "components/recipes/RecipeOwnerActions";

import { BTN_DELETE_RECIPE, BTN_EDIT_RECIPE } from "test/constants";
import { renderWithRouter } from "test/router";

describe("RecipeOwnerActions", () => {
    it("should render delete and edit actions", () => {
        renderWithRouter(
            <RecipeOwnerActions recipeId={1} onDelete={jest.fn()} />,
        );

        expect(
            screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: BTN_EDIT_RECIPE }),
        ).toBeInTheDocument();
    });

    it("should link to the edit page for the given recipeId", () => {
        renderWithRouter(
            <RecipeOwnerActions recipeId={1} onDelete={jest.fn()} />,
        );

        expect(
            screen.getByRole("link", { name: BTN_EDIT_RECIPE }),
        ).toHaveAttribute("href", "/change-recipe/1");
    });
});
