import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeListItem } from "types/recipe";

import { SelectedRecipesList } from "components/menu/SelectedRecipesList";

const RECIPES: RecipeListItem[] = [
    {
        id: 1,
        title: "Pancakes",
        type_name: "Breakfast",
        creation_date: "2026-01-01",
        cooking_time: 20,
    },
    {
        id: 2,
        title: "Borscht",
        type_name: "Soup",
        creation_date: "2026-01-02",
        cooking_time: 90,
    },
];

describe("SelectedRecipesList", () => {
    it("should name the recipe on its remove button", async () => {
        const onRemove = jest.fn();

        render(
            <SelectedRecipesList
                recipes={RECIPES}
                onRemove={onRemove}
                onReorder={jest.fn()}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Remove Borscht" }),
        );

        expect(onRemove).toHaveBeenCalledWith(2);
    });

    it("should move a recipe down by landing the next one before it", async () => {
        const onReorder = jest.fn();

        render(
            <SelectedRecipesList
                recipes={RECIPES}
                onRemove={jest.fn()}
                onReorder={onReorder}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Move Pancakes down" }),
        );

        expect(onReorder).toHaveBeenCalledWith(2, 1);
    });

    it("should move a recipe up by landing it before the previous one", async () => {
        const onReorder = jest.fn();

        render(
            <SelectedRecipesList
                recipes={RECIPES}
                onRemove={jest.fn()}
                onReorder={onReorder}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Move Borscht up" }),
        );

        expect(onReorder).toHaveBeenCalledWith(2, 1);
    });
});
