import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IngredientPicker } from "components/recipes/IngredientPicker";

const SEARCH_PLACEHOLDER = "Search ingredients...";

const INGREDIENTS = [
    { id: 1, name: "Potato", unit_name: "g" },
    { id: 2, name: "Onion", unit_name: "g" },
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

        // the matched substring is wrapped in its own <strong>, which the
        // accessible name computation separates with a space (e.g. "Pot ato")
        expect(
            screen.getByRole("button", { name: /pot/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /onion/i }),
        ).not.toBeInTheDocument();
    });

    it("should not show already-selected ingredients as matches", async () => {
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

        expect(
            screen.queryByRole("button", { name: /potato/i }),
        ).not.toBeInTheDocument();
        // "O" is highlighted separately from "nion", so match the unhighlighted remainder
        expect(
            screen.getByRole("button", { name: /nion/i }),
        ).toBeInTheDocument();
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
});
