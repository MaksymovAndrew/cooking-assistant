import { screen } from "@testing-library/react";

import { ROUTES } from "constants/routes";

import { PantryRecipesCard } from "components/home/PantryRecipesCard";

import { renderWithRouter } from "test/router";

describe("PantryRecipesCard", () => {
    it("should send an empty pantry to the pantry page", () => {
        renderWithRouter(
            <PantryRecipesCard pantryCount={0} cookableCount={null} />,
        );

        expect(
            screen.getByText(
                "Add what you have at home and we'll show what you can cook.",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Open my pantry" }),
        ).toHaveAttribute("href", ROUTES.ingredients);
    });

    it("should show how many recipes the pantry covers", () => {
        renderWithRouter(
            <PantryRecipesCard pantryCount={5} cookableCount={3} />,
        );

        expect(
            screen.getByText(
                "You can cook 3 recipes right now with what you have.",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "See recipes" }),
        ).toHaveAttribute("href", `${ROUTES.allRecipes}?pantry=1`);
    });

    it("should offer the whole list when no recipe is fully covered", () => {
        renderWithRouter(
            <PantryRecipesCard pantryCount={5} cookableCount={0} />,
        );

        expect(
            screen.getByText("Your pantry doesn't cover a whole recipe yet."),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Browse recipes" }),
        ).toHaveAttribute("href", ROUTES.allRecipes);
    });
});
