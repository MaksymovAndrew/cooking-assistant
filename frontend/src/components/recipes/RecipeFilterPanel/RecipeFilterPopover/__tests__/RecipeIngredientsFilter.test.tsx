import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Ingredient } from "types/ingredient";

import { RecipeIngredientsFilter } from "components/recipes/RecipeFilterPanel/RecipeFilterPopover/RecipeIngredientsFilter";

const SEARCH_PLACEHOLDER = "Search ingredients...";
const DEBOUNCE_MS = 300;

const setupUser = () =>
    userEvent.setup({
        advanceTimers: (ms) => {
            jest.advanceTimersByTime(ms);
        },
    });

const MILK: Ingredient = {
    id: 1,
    slug: "milk",
    name: "Milk",
    category: "dairy",
    unit_name: "ml",
    allergens: ["milk"],
    days_to_expire: 7,
    calories_per_unit: null,
};
const ONION: Ingredient = {
    id: 2,
    slug: "onion",
    name: "Onion",
    category: "vegetables",
    unit_name: "g",
    allergens: [],
    days_to_expire: 30,
    calories_per_unit: null,
};
// slugs deliberately don't match any real catalog entry, so resolveIngredientName
// falls back to the fixture's own "name" instead of a real i18n catalog translation
const ALMOND: Ingredient = {
    id: 3,
    slug: "fixture-almond",
    name: "Almond",
    category: "nuts",
    unit_name: "g",
    allergens: ["nuts"],
    days_to_expire: 180,
    calories_per_unit: null,
};
const SALMON: Ingredient = {
    id: 4,
    slug: "fixture-salmon",
    name: "Salmon",
    category: "fish",
    unit_name: "g",
    allergens: ["fish"],
    days_to_expire: 2,
    calories_per_unit: null,
};
const INGREDIENTS = [MILK, ONION];

describe("RecipeIngredientsFilter", () => {
    it("should not show any results before typing a search query", () => {
        render(
            <RecipeIngredientsFilter
                allIngredients={INGREDIENTS}
                selectedIds={[]}
                onChange={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: /Milk/ }),
        ).not.toBeInTheDocument();
    });

    it("should show matching ingredients as the query is typed", async () => {
        jest.useFakeTimers();
        const user = setupUser();

        try {
            render(
                <RecipeIngredientsFilter
                    allIngredients={INGREDIENTS}
                    selectedIds={[]}
                    onChange={jest.fn()}
                />,
            );

            await user.type(
                screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
                "mil",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            expect(
                screen.getByRole("button", { name: "Milk" }),
            ).toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: "Onion" }),
            ).not.toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should call onChange with the ingredient added when a result is selected", async () => {
        jest.useFakeTimers();
        const user = setupUser();
        const onChange = jest.fn();

        try {
            render(
                <RecipeIngredientsFilter
                    allIngredients={INGREDIENTS}
                    selectedIds={[]}
                    onChange={onChange}
                />,
            );

            await user.type(
                screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
                "mil",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });
            await user.click(screen.getByRole("button", { name: "Milk" }));

            expect(onChange).toHaveBeenCalledWith([MILK.id]);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should show already-selected ingredients as removable chips, excluded from results", async () => {
        jest.useFakeTimers();
        const user = setupUser();

        try {
            render(
                <RecipeIngredientsFilter
                    allIngredients={INGREDIENTS}
                    selectedIds={[MILK.id]}
                    onChange={jest.fn()}
                />,
            );

            expect(screen.getByText("Milk")).toBeInTheDocument();

            await user.type(
                screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
                "mil",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            expect(
                screen.queryByRole("button", { name: "Milk" }),
            ).not.toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should call onChange with the ingredient removed when a chip's remove button is clicked", async () => {
        const onChange = jest.fn();

        render(
            <RecipeIngredientsFilter
                allIngredients={INGREDIENTS}
                selectedIds={[MILK.id, ONION.id]}
                onChange={onChange}
            />,
        );

        await userEvent.click(
            screen.getAllByRole("button", { name: "Remove" })[0],
        );

        expect(onChange).toHaveBeenCalledWith([ONION.id]);
    });

    it("should rank a name match that starts with the query before one that only contains it", async () => {
        jest.useFakeTimers();
        const user = setupUser();

        try {
            render(
                <RecipeIngredientsFilter
                    allIngredients={[SALMON, ALMOND]}
                    selectedIds={[]}
                    onChange={jest.fn()}
                />,
            );

            await user.type(
                screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
                "al",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            const results = within(screen.getByRole("list"))
                .getAllByRole("button")
                .map((button) => button.textContent);

            expect(results).toEqual(["Almond", "Salmon"]);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should show a no-matches message when nothing matches", async () => {
        jest.useFakeTimers();
        const user = setupUser();

        try {
            render(
                <RecipeIngredientsFilter
                    allIngredients={INGREDIENTS}
                    selectedIds={[]}
                    onChange={jest.fn()}
                />,
            );

            await user.type(
                screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
                "zzz",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            expect(
                screen.getByText("No ingredients found"),
            ).toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });
});
