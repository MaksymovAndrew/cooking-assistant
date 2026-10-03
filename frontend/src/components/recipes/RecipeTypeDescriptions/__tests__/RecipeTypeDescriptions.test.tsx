import { render, screen } from "@testing-library/react";

import type { RecipeTypeSummary } from "types/recipeType";

import { RecipeTypeDescriptions } from "components/recipes/RecipeTypeDescriptions";

const TYPES: RecipeTypeSummary[] = [
    { id: 1, type_name: "Soup", description: "Liquid-based dishes" },
    { id: 2, type_name: "Salad", description: "Fresh and light" },
];

describe("RecipeTypeDescriptions", () => {
    it("should render nothing when descriptions list is empty", () => {
        const { container } = render(
            <RecipeTypeDescriptions descriptions={[]} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("should render a paragraph for each description", () => {
        render(<RecipeTypeDescriptions descriptions={TYPES} />);

        expect(screen.getByText(/Liquid-based dishes/)).toBeInTheDocument();
        expect(screen.getByText(/Fresh and light/)).toBeInTheDocument();
    });
});
