import { render, screen } from "@testing-library/react";

import { IngredientGrid } from "components/ingredients/IngredientGrid";

describe("IngredientGrid", () => {
    it("should show the empty message instead of cards when there are no ingredients", () => {
        render(
            <IngredientGrid
                ingredients={[]}
                emptyMessage="No ingredients"
                onOpenHistory={jest.fn()}
                onRestock={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        expect(screen.getByText("No ingredients")).toBeInTheDocument();
    });
});
