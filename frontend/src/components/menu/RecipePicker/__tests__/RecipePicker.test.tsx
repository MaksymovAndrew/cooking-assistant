import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecipePicker } from "components/menu/RecipePicker";

const SEARCH_PLACEHOLDER = "Search recipes...";
const DEBOUNCE_MS = 300;

const setupUser = () =>
    userEvent.setup({
        advanceTimers: (ms) => {
            jest.advanceTimersByTime(ms);
        },
    });

const RECIPES = [
    {
        id: 1,
        title: "Potato soup",
        type_name: "Soup",
        creation_date: "",
        cooking_time: 30,
    },
    {
        id: 2,
        title: "Onion tart",
        type_name: "Baking",
        creation_date: "",
        cooking_time: 45,
    },
];

describe("RecipePicker", () => {
    it("should not show any results before typing a search query", () => {
        render(
            <RecipePicker
                allRecipes={RECIPES}
                selectedIds={[]}
                label="Recipes"
                onToggle={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: /Potato/ }),
        ).not.toBeInTheDocument();
    });

    it("should show matching recipes as the query is typed", async () => {
        jest.useFakeTimers();
        const user = setupUser();

        try {
            render(
                <RecipePicker
                    allRecipes={RECIPES}
                    selectedIds={[]}
                    label="Recipes"
                    onToggle={jest.fn()}
                />,
            );

            await user.type(
                screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
                "pot",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            // the matched substring is wrapped in its own <strong>, which the accessible name computation separates with a space (e.g. "Pot ato soup")
            expect(
                screen.getByRole("button", { name: /pot/i }),
            ).toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: /onion/i }),
            ).not.toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should not show already-selected recipes as matches", async () => {
        jest.useFakeTimers();
        const user = setupUser();

        try {
            render(
                <RecipePicker
                    allRecipes={RECIPES}
                    selectedIds={[1]}
                    label="Recipes"
                    onToggle={jest.fn()}
                />,
            );

            await user.type(
                screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
                "o",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            expect(
                screen.queryByRole("button", { name: /potato/i }),
            ).not.toBeInTheDocument();
            // "O" is highlighted separately from "nion tart", so match the unhighlighted remainder
            expect(
                screen.getByRole("button", { name: /nion/i }),
            ).toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should show a no-matches message when nothing matches", async () => {
        jest.useFakeTimers();
        const user = setupUser();

        try {
            render(
                <RecipePicker
                    allRecipes={RECIPES}
                    selectedIds={[]}
                    label="Recipes"
                    onToggle={jest.fn()}
                />,
            );

            await user.type(
                screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
                "zzz",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            expect(screen.getByText("No recipes found")).toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should call onToggle and clear the query when a result is selected", async () => {
        jest.useFakeTimers();
        const user = setupUser();
        const onToggle = jest.fn();

        try {
            render(
                <RecipePicker
                    allRecipes={RECIPES}
                    selectedIds={[]}
                    label="Recipes"
                    onToggle={onToggle}
                />,
            );

            const input = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);

            await user.type(input, "pot");
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });
            await user.click(screen.getByRole("button", { name: /pot/i }));

            expect(onToggle).toHaveBeenCalledWith(RECIPES[0]);
            expect(input).toHaveValue("");
        } finally {
            jest.useRealTimers();
        }
    });

    it("should clear the query when the clear button is clicked", async () => {
        render(
            <RecipePicker
                allRecipes={RECIPES}
                selectedIds={[]}
                label="Recipes"
                onToggle={jest.fn()}
            />,
        );

        const input = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);

        await userEvent.type(input, "pot");
        await userEvent.click(screen.getByRole("button", { name: "Clear" }));

        expect(input).toHaveValue("");
    });
});
