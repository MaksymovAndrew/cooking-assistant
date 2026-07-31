import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

import { AddIngredientModal } from "components/ingredients/AddIngredientModal";

const SEARCH_PLACEHOLDER = "Search ingredients...";
const DEBOUNCE_MS = 300;

const setupUser = () =>
    userEvent.setup({
        advanceTimers: (ms) => {
            jest.advanceTimersByTime(ms);
        },
    });
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
        jest.useFakeTimers();
        const user = setupUser();

        try {
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

            await user.type(
                screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
                "o",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            // both "Potato" and "Onion" contain "o", but Onion is already owned
            expect(
                screen.getByRole("button", { name: /tato/i }),
            ).toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: /nion/i }),
            ).not.toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should call onToggle when a result is selected", async () => {
        jest.useFakeTimers();
        const user = setupUser();
        const onToggle = jest.fn();

        try {
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

            await user.type(
                screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
                "pot",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });
            await user.click(screen.getByRole("button", { name: /pot/i }));

            expect(onToggle).toHaveBeenCalledWith(1);
        } finally {
            jest.useRealTimers();
        }
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

    it("should close only the dropdown on Escape, not the whole modal", async () => {
        const onClose = jest.fn();

        render(
            <AddIngredientModal
                allIngredients={ALL_INGREDIENTS}
                personIngredients={OWNED}
                selectedIngredients={[]}
                onToggle={jest.fn()}
                onSave={jest.fn()}
                onClose={onClose}
            />,
        );

        await userEvent.click(screen.getByPlaceholderText(SEARCH_PLACEHOLDER));
        expect(
            screen.getByRole("button", { name: /^Vegetables/ }),
        ).toBeInTheDocument();

        await userEvent.keyboard("{Escape}");

        expect(
            screen.queryByRole("button", { name: /^Vegetables/ }),
        ).not.toBeInTheDocument();
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();

        await userEvent.keyboard("{Escape}");

        expect(onClose).toHaveBeenCalledTimes(1);
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
