import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecipeFilterPanel } from "components/recipes/RecipeFilterPanel";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

import { renderWithRouter } from "test/router";

const SOUP_TYPE = { id: 1, type_name: "Soup", description: "" };
const DESSERT_TYPE = { id: 2, type_name: "Dessert", description: "" };

const BASE_FILTERS: RecipeFilterState = {
    search: "",
    types: [],
    cookingTime: { min: "", max: "" },
    sort: null,
    inPantry: false,
};

const setup = (overrides: Partial<RecipeFilterState> = {}, activeCount = 0) => {
    const setValue = jest.fn();
    const resetFilters = jest.fn();

    renderWithRouter(
        <RecipeFilterPanel
            filters={{ ...BASE_FILTERS, ...overrides }}
            setValue={setValue}
            resetFilters={resetFilters}
            activeCount={activeCount}
            types={[SOUP_TYPE, DESSERT_TYPE]}
            searchPlaceholder="Search recipes"
            total={5}
        />,
    );

    return { setValue, resetFilters };
};

const openPanel = async () => {
    await userEvent.click(screen.getByRole("button", { name: /Filters/ }));
};

describe("RecipeFilterPanel", () => {
    it("should render the search input with the given placeholder", () => {
        setup();

        expect(
            screen.getByPlaceholderText(/search recipes/i),
        ).toBeInTheDocument();
    });

    it("should not show the popover by default", () => {
        setup();

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should open the popover when the Filters trigger is clicked", async () => {
        setup();

        await openPanel();

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should show a badge with the given active filter count", () => {
        setup({}, 2);

        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should call setValue with the updated range when the time inputs change", async () => {
        const { setValue } = setup();

        await openPanel();
        await userEvent.type(screen.getByLabelText("Min"), "5");

        expect(setValue).toHaveBeenCalledWith("cookingTime", {
            min: "5",
            max: "",
        });
    });

    it("should call setValue with the sort direction when a sort segment is clicked", async () => {
        const { setValue } = setup();

        await openPanel();
        await userEvent.click(
            screen.getByRole("radio", { name: "Long → fast" }),
        );

        expect(setValue).toHaveBeenCalledWith("sort", "desc");
    });

    it("should call setValue with the toggled type list when a type chip is clicked", async () => {
        const { setValue } = setup();

        await openPanel();
        await userEvent.click(screen.getByRole("checkbox", { name: "Soup" }));

        expect(setValue).toHaveBeenCalledWith("types", [1]);
    });

    it("should call setValue with true when the pantry toggle is clicked", async () => {
        const { setValue } = setup();

        await openPanel();
        await userEvent.click(screen.getByRole("switch"));

        expect(setValue).toHaveBeenCalledWith("inPantry", true);
    });

    it("should call resetFilters when Reset filters is clicked", async () => {
        const { resetFilters } = setup({ types: [1], inPantry: true }, 2);

        await openPanel();
        await userEvent.click(
            screen.getByRole("button", { name: "Reset filters" }),
        );

        expect(resetFilters).toHaveBeenCalledTimes(1);
    });

    it("should close the popover when Apply is clicked", async () => {
        setup();

        await openPanel();
        await userEvent.click(
            screen.getByRole("button", { name: "Show 5 recipes" }),
        );

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should close the popover when clicking outside of it", async () => {
        renderWithRouter(
            <div>
                <RecipeFilterPanel
                    filters={BASE_FILTERS}
                    setValue={jest.fn()}
                    resetFilters={jest.fn()}
                    activeCount={0}
                    types={[]}
                    searchPlaceholder="Search recipes"
                    total={5}
                />
                <button type="button">Outside</button>
            </div>,
        );

        await openPanel();
        await userEvent.click(screen.getByRole("button", { name: "Outside" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
