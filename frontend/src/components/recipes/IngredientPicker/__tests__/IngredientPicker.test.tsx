import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IngredientPicker } from "components/recipes/IngredientPicker";

const SEARCH_PLACEHOLDER = "Search ingredients...";

const INGREDIENTS = [
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

describe("IngredientPicker", () => {
    it("should not show any results before typing a search query", () => {
        render(
            <IngredientPicker
                allIngredients={INGREDIENTS}
                selectedIds={[]}
                label="Ingredients"
                onToggle={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: /Potato/ }),
        ).not.toBeInTheDocument();
    });

    it("should show matching ingredients as the query is typed", async () => {
        render(
            <IngredientPicker
                allIngredients={INGREDIENTS}
                selectedIds={[]}
                label="Ingredients"
                onToggle={jest.fn()}
            />,
        );

        await userEvent.type(
            screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
            "pot",
        );

        // the matched substring is wrapped in its own <strong>, which the accessible name computation separates with a space (e.g. "Pot ato")
        expect(
            screen.getByRole("button", { name: /pot/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /onion/i }),
        ).not.toBeInTheDocument();
    });

    it("should show already-selected ingredients as a disabled match", async () => {
        render(
            <IngredientPicker
                allIngredients={INGREDIENTS}
                selectedIds={[1]}
                label="Ingredients"
                onToggle={jest.fn()}
            />,
        );

        await userEvent.type(
            screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
            "o",
        );

        // the matched "o" is highlighted separately, so match the unhighlighted remainder
        expect(screen.getByRole("button", { name: /tato/i })).toBeDisabled();
        expect(
            screen.getByRole("button", { name: /nion/i }),
        ).not.toBeDisabled();
    });

    it("should show a no-matches message when nothing matches", async () => {
        render(
            <IngredientPicker
                allIngredients={INGREDIENTS}
                selectedIds={[]}
                label="Ingredients"
                onToggle={jest.fn()}
            />,
        );

        await userEvent.type(
            screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
            "zzz",
        );

        expect(screen.getByText("No ingredients found")).toBeInTheDocument();
    });

    it("should call onToggle and clear the query when a result is selected", async () => {
        const onToggle = jest.fn();

        render(
            <IngredientPicker
                allIngredients={INGREDIENTS}
                selectedIds={[]}
                label="Ingredients"
                onToggle={onToggle}
            />,
        );

        const input = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);

        await userEvent.type(input, "pot");
        await userEvent.click(screen.getByRole("button", { name: /pot/i }));

        expect(onToggle).toHaveBeenCalledWith(INGREDIENTS[0]);
        expect(input).toHaveValue("");
    });

    it("should clear the query when the clear button is clicked", async () => {
        render(
            <IngredientPicker
                allIngredients={INGREDIENTS}
                selectedIds={[]}
                label="Ingredients"
                onToggle={jest.fn()}
            />,
        );

        const input = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);

        await userEvent.type(input, "pot");
        await userEvent.click(screen.getByRole("button", { name: "Clear" }));

        expect(input).toHaveValue("");
    });

    it("should browse ingredients by category when the search box is focused without typing", async () => {
        render(
            <IngredientPicker
                allIngredients={INGREDIENTS}
                selectedIds={[]}
                label="Ingredients"
                onToggle={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByPlaceholderText(SEARCH_PLACEHOLDER));

        expect(
            screen.getByRole("button", { name: /^Vegetables/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /^Fish/ }),
        ).toBeInTheDocument();
    });

    it("should show a category's ingredients after clicking it, then go back to the category list", async () => {
        render(
            <IngredientPicker
                allIngredients={INGREDIENTS}
                selectedIds={[]}
                label="Ingredients"
                onToggle={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByPlaceholderText(SEARCH_PLACEHOLDER));
        await userEvent.click(
            screen.getByRole("button", { name: /^Vegetables/ }),
        );

        expect(
            screen.getByRole("button", { name: /onion/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /potato/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /salmon/i }),
        ).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: /Back to categories/i }),
        );

        expect(
            screen.getByRole("button", { name: /^Vegetables/ }),
        ).toBeInTheDocument();
    });
});
