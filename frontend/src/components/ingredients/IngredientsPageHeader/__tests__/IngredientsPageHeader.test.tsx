import { render, screen } from "@testing-library/react";

import { IngredientsPageHeader } from "components/ingredients/IngredientsPageHeader";

describe("IngredientsPageHeader", () => {
    it("should show the item count", () => {
        render(<IngredientsPageHeader count={3} onAddIngredient={jest.fn()} />);

        expect(screen.getByText("3 items in your pantry")).toBeInTheDocument();
    });

    it("should show no count while the pantry is still loading", () => {
        render(
            <IngredientsPageHeader count={null} onAddIngredient={jest.fn()} />,
        );

        expect(screen.queryByText(/in your pantry/)).not.toBeInTheDocument();
    });
});
