import { render, screen } from "@testing-library/react";

import { RecipeMetaInfo } from "components/recipes/RecipeMetaInfo";

const RECIPE = {
    id: 1,
    title: "Borscht",
    content: "Boil and simmer",
    ingredients: [],
    type_id: 2,
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    servings: "4",
    person_id: 3,
    isOwner: true,
};

describe("RecipeMetaInfo", () => {
    it("should render recipe type and description content", () => {
        render(<RecipeMetaInfo recipe={RECIPE} />);

        expect(screen.getByText("Soup")).toBeInTheDocument();
        expect(screen.getByText("Boil and simmer")).toBeInTheDocument();
        expect(screen.getByText(/Recipe type:/)).toBeInTheDocument();
    });
});
