import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuDetailRecipe } from "types/menu";

import { MenuRecipesPanel } from "components/menu/MenuRecipesPanel";

import { renderWithRouter } from "test/router";

const DEBOUNCE_MS = 300;

const setupUser = () =>
    userEvent.setup({
        advanceTimers: (ms) => {
            jest.advanceTimersByTime(ms);
        },
    });

const RECIPES: MenuDetailRecipe[] = [
    {
        recipe_id: 1,
        title: "Borscht",
        language: "en",
        type_name: "Soup",
        cooking_time: 60,
        creation_date: "2024-01-01",
        calories_per_portion: null,
        photo_key: null,
        ratingAverage: null,
        ratingCount: 0,
    },
    {
        recipe_id: 2,
        title: "Pancakes",
        language: "en",
        type_name: "Breakfast",
        cooking_time: 20,
        creation_date: "2024-01-02",
        calories_per_portion: null,
        photo_key: null,
        ratingAverage: null,
        ratingCount: 0,
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
        jest.useFakeTimers();
        const user = setupUser();

        try {
            renderWithRouter(
                <MenuRecipesPanel
                    recipes={RECIPES}
                    isOwner={false}
                    addRecipesTo="/change-menu/1"
                />,
            );

            await user.type(
                screen.getByPlaceholderText("Search in this menu…"),
                "borscht",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            expect(screen.getByText("Borscht")).toBeInTheDocument();
            expect(screen.queryByText("Pancakes")).not.toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should show a no-results message when the search matches nothing", async () => {
        jest.useFakeTimers();
        const user = setupUser();

        try {
            renderWithRouter(
                <MenuRecipesPanel
                    recipes={RECIPES}
                    isOwner={false}
                    addRecipesTo="/change-menu/1"
                />,
            );

            await user.type(
                screen.getByPlaceholderText("Search in this menu…"),
                "zzz",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            expect(
                screen.getByText("No recipes match your search."),
            ).toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should tell the owner the recipes were removed and offer to add new ones", () => {
        renderWithRouter(
            <MenuRecipesPanel
                recipes={[]}
                isOwner={true}
                addRecipesTo="/change-menu/1"
            />,
        );

        expect(
            screen.getByText("The recipes in this menu were removed"),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Add new recipes, or delete the menu/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /Add recipes/ }),
        ).toHaveAttribute("href", "/change-menu/1");
    });

    it("should tell a visitor the recipes were removed, without an add-recipes link", () => {
        renderWithRouter(
            <MenuRecipesPanel
                recipes={[]}
                isOwner={false}
                addRecipesTo="/change-menu/1"
            />,
        );

        expect(
            screen.getByText(/nothing to cook from this menu/),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: /Add recipes/ }),
        ).not.toBeInTheDocument();
    });
});
