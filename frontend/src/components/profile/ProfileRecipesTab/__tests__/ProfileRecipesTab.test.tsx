import { screen } from "@testing-library/react";

import type { RecipeSearchResultItem } from "types/recipe";

import { ProfileRecipesTab } from "components/profile/ProfileRecipesTab";

import { renderWithRouter } from "test/router";

const RECIPE: RecipeSearchResultItem = {
    id: 1,
    title: "Borscht",
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 60,
    ingredients: [],
    calories_per_portion: null,
};

describe("ProfileRecipesTab", () => {
    it("should render a card per recipe", () => {
        renderWithRouter(
            <ProfileRecipesTab
                recipes={[RECIPE]}
                total={1}
                hasNextPage={false}
                isFetchingNextPage={false}
                fetchNextPage={jest.fn()}
            />,
        );

        expect(screen.getByText("Borscht")).toBeInTheDocument();
    });

    it("should show an empty state when there are no recipes", () => {
        renderWithRouter(
            <ProfileRecipesTab
                recipes={[]}
                total={0}
                hasNextPage={false}
                isFetchingNextPage={false}
                fetchNextPage={jest.fn()}
            />,
        );

        expect(
            screen.getByText("You haven't created any recipes yet."),
        ).toBeInTheDocument();
    });
});
