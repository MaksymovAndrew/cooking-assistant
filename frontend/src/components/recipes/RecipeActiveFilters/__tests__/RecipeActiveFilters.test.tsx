import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeFilterParams } from "types/recipe";

import type { ActiveFilterEntry } from "hooks/useListFilters";

import { RecipeActiveFilters } from "components/recipes/RecipeActiveFilters";

import { RECIPE_FILTER_DEFS } from "utils/filters/recipeFilterDefs";

const [SEARCH_DEF, TYPES_DEF, INGREDIENTS_DEF] = RECIPE_FILTER_DEFS;

const makeEntry = (
    def: (typeof RECIPE_FILTER_DEFS)[number],
    value: unknown,
    remove = jest.fn(),
): ActiveFilterEntry<RecipeFilterParams> => ({ def, value, remove });

describe("RecipeActiveFilters", () => {
    it("should show the recipe count", () => {
        render(
            <RecipeActiveFilters
                total={3}
                activeFilters={[]}
                hasActiveFilters={false}
                resetFilters={jest.fn()}
            />,
        );

        expect(screen.getByText("3 recipes")).toBeInTheDocument();
    });

    it("should show a removable chip for an active search query", () => {
        render(
            <RecipeActiveFilters
                total={3}
                activeFilters={[makeEntry(SEARCH_DEF, "borscht")]}
                hasActiveFilters
                resetFilters={jest.fn()}
            />,
        );

        expect(screen.getByText("“borscht”")).toBeInTheDocument();
    });

    it("should show a removable chip summarizing the selected types", () => {
        const remove = jest.fn();

        render(
            <RecipeActiveFilters
                total={3}
                activeFilters={[makeEntry(TYPES_DEF, [1, 2], remove)]}
                hasActiveFilters
                resetFilters={jest.fn()}
            />,
        );

        expect(screen.getByText("2 types")).toBeInTheDocument();
    });

    it("should show a removable chip summarizing the selected ingredients", async () => {
        const remove = jest.fn();

        render(
            <RecipeActiveFilters
                total={3}
                activeFilters={[makeEntry(INGREDIENTS_DEF, [1], remove)]}
                hasActiveFilters
                resetFilters={jest.fn()}
            />,
        );

        expect(screen.getByText("1 ingredient")).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: "Remove 1 ingredient" }),
        );

        expect(remove).toHaveBeenCalledTimes(1);
    });
});
