import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

import { AddIngredientModal } from "components/ingredients/AddIngredientModal";

const ALL_INGREDIENTS: Ingredient[] = [
    {
        id: 1,
        slug: "potato",
        name: "Potato",
        category: "vegetables",
        unit_name: "g",
        allergens: [],
        days_to_expire: 30,
        calories_per_unit: null,
    },
    {
        id: 2,
        slug: "onion",
        name: "Onion",
        category: "vegetables",
        unit_name: "g",
        allergens: [],
        days_to_expire: 30,
        calories_per_unit: null,
    },
];
const OWNED: PantryIngredient[] = [
    {
        id: 2,
        ingredient_name: "Onion",
        unit_name: "g",
        quantity_person_ingradient: 1,
        allergens: [],
    },
];

describe("AddIngredientModal", () => {
    it("should exclude already-owned ingredients from the search results", async () => {
        render(
            <AddIngredientModal
                allIngredients={ALL_INGREDIENTS}
                personIngredients={OWNED}
                selectedIngredients={[]}
                onToggle={jest.fn()}
                onSave={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        await userEvent.type(
            screen.getByPlaceholderText("Search ingredients..."),
            "o",
        );

        // both "Potato" and "Onion" contain "o", but Onion is already owned
        expect(
            screen.getByRole("button", { name: /tato/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /nion/i }),
        ).not.toBeInTheDocument();
    });

    it("should call onToggle when a result is selected", async () => {
        const onToggle = jest.fn();

        render(
            <AddIngredientModal
                allIngredients={ALL_INGREDIENTS}
                personIngredients={OWNED}
                selectedIngredients={[]}
                onToggle={onToggle}
                onSave={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        await userEvent.type(
            screen.getByPlaceholderText("Search ingredients..."),
            "pot",
        );
        await userEvent.click(screen.getByRole("button", { name: /pot/i }));

        expect(onToggle).toHaveBeenCalledWith(1);
    });

    it("should show newly selected ingredients as removable chips", async () => {
        const onToggle = jest.fn();

        render(
            <AddIngredientModal
                allIngredients={ALL_INGREDIENTS}
                personIngredients={OWNED}
                selectedIngredients={[1]}
                onToggle={onToggle}
                onSave={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        expect(screen.getByText("Potato")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Remove" }));

        expect(onToggle).toHaveBeenCalledWith(1);
    });

    it("should call onSave and onClose from the footer buttons", async () => {
        const onSave = jest.fn();
        const onClose = jest.fn();

        render(
            <AddIngredientModal
                allIngredients={ALL_INGREDIENTS}
                personIngredients={OWNED}
                selectedIngredients={[]}
                onToggle={jest.fn()}
                onSave={onSave}
                onClose={onClose}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Add to pantry" }),
        );
        expect(onSave).toHaveBeenCalledTimes(1);

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
