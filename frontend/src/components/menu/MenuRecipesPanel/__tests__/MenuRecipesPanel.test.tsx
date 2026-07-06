import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuDetailRecipe } from "types/menu";

import { MenuRecipesPanel } from "components/menu/MenuRecipesPanel";

import { renderWithRouter } from "test/router";

const RECIPES: MenuDetailRecipe[] = [
    {
        recipe_id: 1,
        title: "Borscht",
        type_name: "Soup",
        cooking_time: 60,
        creation_date: "2024-01-01",
    },
    {
        recipe_id: 2,
        title: "Pancakes",
        type_name: "Breakfast",
        cooking_time: 20,
        creation_date: "2024-01-02",
    },
];

describe("MenuRecipesPanel", () => {
    it("should render a card per recipe with the total count", () => {
        renderWithRouter(
            <MenuRecipesPanel
                recipes={RECIPES}
                isOwner={false}
                addRecipesTo="/change-menu/1"
            />,
        );

        expect(screen.getByText("Borscht")).toBeInTheDocument();
        expect(screen.getByText("Pancakes")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should filter recipes by the search query", async () => {
        renderWithRouter(
            <MenuRecipesPanel
                recipes={RECIPES}
                isOwner={false}
                addRecipesTo="/change-menu/1"
            />,
        );

        await userEvent.type(
            screen.getByPlaceholderText("Search in this menu…"),
            "borscht",
        );

        expect(screen.getByText("Borscht")).toBeInTheDocument();
        expect(screen.queryByText("Pancakes")).not.toBeInTheDocument();
    });

    it("should show a no-results message when the search matches nothing", async () => {
        renderWithRouter(
            <MenuRecipesPanel
                recipes={RECIPES}
                isOwner={false}
                addRecipesTo="/change-menu/1"
            />,
        );

        await userEvent.type(
            screen.getByPlaceholderText("Search in this menu…"),
            "zzz",
        );

        expect(
            screen.getByText("No recipes match your search."),
        ).toBeInTheDocument();
    });

    it("should show an empty state with an add-recipes link for the owner when there are no recipes", () => {
        renderWithRouter(
            <MenuRecipesPanel
                recipes={[]}
                isOwner={true}
                addRecipesTo="/change-menu/1"
            />,
        );

        expect(screen.getByText("No recipes yet")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /Add recipes/ }),
        ).toHaveAttribute("href", "/change-menu/1");
    });

    it("should show an empty state without an add-recipes link for a visitor", () => {
        renderWithRouter(
            <MenuRecipesPanel
                recipes={[]}
                isOwner={false}
                addRecipesTo="/change-menu/1"
            />,
        );

        expect(screen.getByText("No recipes yet")).toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: /Add recipes/ }),
        ).not.toBeInTheDocument();
    });
});
