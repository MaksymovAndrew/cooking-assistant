import { render, screen } from "@testing-library/react";

import { RecipeDescriptionPanel } from "components/recipes/RecipeDescriptionPanel";

describe("RecipeDescriptionPanel", () => {
    it("should render the description text", () => {
        render(
            <RecipeDescriptionPanel
                content="A deeply savoury slow-cooked ragù."
                allergens={[]}
            />,
        );

        expect(
            screen.getByText("A deeply savoury slow-cooked ragù."),
        ).toBeInTheDocument();
    });

    it("should not show the allergens section when there are none", () => {
        render(<RecipeDescriptionPanel content="Tasty." allergens={[]} />);

        expect(screen.queryByText("Allergens")).not.toBeInTheDocument();
    });

    it("should list every allergen when present", () => {
        render(
            <RecipeDescriptionPanel
                content="Tasty."
                allergens={["gluten", "milk"]}
            />,
        );

        expect(screen.getByText("Allergens")).toBeInTheDocument();
        expect(screen.getByText("Gluten")).toBeInTheDocument();
        expect(screen.getByText("Milk")).toBeInTheDocument();
    });
});
