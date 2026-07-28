import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

import { AddIngredientModal } from "components/ingredients/AddIngredientModal";

const SEARCH_PLACEHOLDER = "Search ingredients...";
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
    {
        id: 3,
        slug: "salmon",
        name: "Salmon",
        category: "fish",
        unit_name: "g",
        allergens: ["fish"],
        days_to_expire: 2,
        calories_per_unit: null,
    },
];
const OWNED: PantryIngredient[] = [
    {
        id: 2,
        slug: "onion",
        ingredient_name: "Onion",
        category: "vegetables",
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
            screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
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
            screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
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

    it("should browse addable ingredients by category, excluding already-owned ones", async () => {
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

        await userEvent.click(screen.getByPlaceholderText(SEARCH_PLACEHOLDER));

        // Onion is owned, so the vegetables category only has Potato left
        expect(
            screen.getByRole("button", { name: /^Vegetables/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /^Fish/ }),
        ).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: /^Vegetables/ }),
        );

        expect(
            screen.getByRole("button", { name: /potato/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /salmon/i }),
        ).not.toBeInTheDocument();
    });

    it("should return to the category list, not a broken empty state, after selecting a category's last addable item", async () => {
        const onToggle = jest.fn();

        const { rerender } = render(
            <AddIngredientModal
                allIngredients={ALL_INGREDIENTS}
                personIngredients={OWNED}
                selectedIngredients={[]}
                onToggle={onToggle}
                onSave={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByPlaceholderText(SEARCH_PLACEHOLDER));
        await userEvent.click(screen.getByRole("button", { name: /^Fish/ }));
        await userEvent.click(screen.getByRole("button", { name: /salmon/i }));

        expect(onToggle).toHaveBeenCalledWith(3);

        // simulate the parent committing the selection - Fish has nothing left to add now
        rerender(
            <AddIngredientModal
                allIngredients={ALL_INGREDIENTS}
                personIngredients={OWNED}
                selectedIngredients={[3]}
                onToggle={onToggle}
                onSave={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: /^Fish/ }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText("No ingredients found"),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /^Vegetables/ }),
        ).toBeInTheDocument();
    });
});
