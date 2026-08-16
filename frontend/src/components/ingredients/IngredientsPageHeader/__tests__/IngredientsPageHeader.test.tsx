import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IngredientsPageHeader } from "components/ingredients/IngredientsPageHeader";

describe("IngredientsPageHeader", () => {
    it("should show the item count", () => {
        render(<IngredientsPageHeader count={3} onAddIngredient={jest.fn()} />);

        expect(screen.getByText("3 items in your pantry")).toBeInTheDocument();
    });

    it("should call onAddIngredient when Add ingredient is clicked", async () => {
        const onAddIngredient = jest.fn();

        render(
            <IngredientsPageHeader
                count={3}
                onAddIngredient={onAddIngredient}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Add ingredient" }),
        );

        expect(onAddIngredient).toHaveBeenCalledTimes(1);
    });
});
