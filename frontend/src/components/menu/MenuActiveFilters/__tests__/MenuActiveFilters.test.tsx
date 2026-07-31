import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuListParams } from "types/menu";

import type { ActiveFilterEntry } from "hooks/useListFilters";

import { MenuActiveFilters } from "components/menu/MenuActiveFilters";

import { MENU_FILTER_DEFS } from "utils/filters/menuFilterDefs";

const [SEARCH_DEF, CATEGORIES_DEF] = MENU_FILTER_DEFS;

const makeEntry = (
    def: typeof SEARCH_DEF,
    value: unknown,
    remove = jest.fn(),
): ActiveFilterEntry<MenuListParams> => ({ def, value, remove });

describe("MenuActiveFilters", () => {
    it("should show the menu count", () => {
        render(
            <MenuActiveFilters
                total={3}
                activeFilters={[]}
                hasActiveFilters={false}
                resetFilters={jest.fn()}
            />,
        );

        expect(screen.getByText("3 menus")).toBeInTheDocument();
    });

    it("should not show the clear button when no filter is active", () => {
        render(
            <MenuActiveFilters
                total={3}
                activeFilters={[]}
                hasActiveFilters={false}
                resetFilters={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: "Reset filters" }),
        ).not.toBeInTheDocument();
    });

    it("should reset every filter when the clear button is clicked", async () => {
        const resetFilters = jest.fn();

        render(
            <MenuActiveFilters
                total={3}
                activeFilters={[makeEntry(CATEGORIES_DEF, [1])]}
                hasActiveFilters
                resetFilters={resetFilters}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Reset filters" }),
        );

        expect(resetFilters).toHaveBeenCalledTimes(1);
    });

    it("should show a removable chip for an active search query", () => {
        render(
            <MenuActiveFilters
                total={3}
                activeFilters={[makeEntry(SEARCH_DEF, "cauliflower")]}
                hasActiveFilters
                resetFilters={jest.fn()}
            />,
        );

        expect(screen.getByText("“cauliflower”")).toBeInTheDocument();
    });

    it("should remove only the dismissed filter when its chip is clicked", async () => {
        const remove = jest.fn();

        render(
            <MenuActiveFilters
                total={3}
                activeFilters={[makeEntry(SEARCH_DEF, "cauliflower", remove)]}
                hasActiveFilters
                resetFilters={jest.fn()}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Remove “cauliflower”" }),
        );

        expect(remove).toHaveBeenCalledTimes(1);
    });

    it("should show a removable chip summarizing the selected categories", async () => {
        const remove = jest.fn();

        render(
            <MenuActiveFilters
                total={3}
                activeFilters={[makeEntry(CATEGORIES_DEF, [1, 2], remove)]}
                hasActiveFilters
                resetFilters={jest.fn()}
            />,
        );

        expect(screen.getByText("2 categories")).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: "Remove 2 categories" }),
        );

        expect(remove).toHaveBeenCalledTimes(1);
    });
});
