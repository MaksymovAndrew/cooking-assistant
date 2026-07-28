import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeFilterState } from "hooks/useRecipeListView";

import { RecipeFilterPanel } from "components/recipes/RecipeFilterPanel";

import { renderWithRouter } from "test/router";

const SOUP_TYPE = { id: 1, type_name: "Soup", description: "" };
const DESSERT_TYPE = { id: 2, type_name: "Dessert", description: "" };

const BASE_FILTERS: RecipeFilterState = {
    selectedTypes: [],
    startDate: "",
    endDate: "",
    minCookingTime: "",
    maxCookingTime: "",
    sortOrder: "asc",
    inPantry: false,
    ingredientName: null,
};

const setup = (overrides: Partial<RecipeFilterState> = {}) => {
    const setSelectedTypes = jest.fn();
    const setMinCookingTime = jest.fn();
    const setMaxCookingTime = jest.fn();
    const setSortOrder = jest.fn();
    const setInPantry = jest.fn();

    renderWithRouter(
        <RecipeFilterPanel
            filters={{ ...BASE_FILTERS, ...overrides }}
            setSelectedTypes={setSelectedTypes}
            setMinCookingTime={setMinCookingTime}
            setMaxCookingTime={setMaxCookingTime}
            setSortOrder={setSortOrder}
            setInPantry={setInPantry}
            types={[SOUP_TYPE, DESSERT_TYPE]}
            searchPlaceholder="Search recipes"
            total={5}
        />,
    );

    return {
        setSelectedTypes,
        setMinCookingTime,
        setMaxCookingTime,
        setSortOrder,
        setInPantry,
    };
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

    it("should show a badge with the active filter count", () => {
        setup({ selectedTypes: [1], maxCookingTime: "90" });

        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should call setMinCookingTime and setMaxCookingTime when the time inputs change", async () => {
        const { setMinCookingTime, setMaxCookingTime } = setup();

        await openPanel();
        await userEvent.type(screen.getByLabelText("Min"), "5");
        await userEvent.type(screen.getByLabelText("Max"), "9");

        expect(setMinCookingTime).toHaveBeenCalled();
        expect(setMaxCookingTime).toHaveBeenCalled();
    });

    it("should call setSortOrder when a sort segment is clicked", async () => {
        const { setSortOrder } = setup();

        await openPanel();
        await userEvent.click(
            screen.getByRole("radio", { name: "Long → fast" }),
        );

        expect(setSortOrder).toHaveBeenCalledWith("desc");
    });

    it("should toggle a type when its chip is clicked", async () => {
        const { setSelectedTypes } = setup();

        await openPanel();
        await userEvent.click(screen.getByRole("checkbox", { name: "Soup" }));

        expect(setSelectedTypes).toHaveBeenCalledWith([1]);
    });

    it("should call setInPantry when the pantry toggle is clicked", async () => {
        const { setInPantry } = setup();

        await openPanel();
        await userEvent.click(screen.getByRole("switch"));

        expect(setInPantry).toHaveBeenCalledWith(true);
    });

    it("should count the pantry filter in the active filter badge", () => {
        setup({ inPantry: true });

        expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should reset every filter when Reset filters is clicked", async () => {
        const {
            setSelectedTypes,
            setMinCookingTime,
            setMaxCookingTime,
            setSortOrder,
            setInPantry,
        } = setup({
            selectedTypes: [1],
            minCookingTime: "5",
            maxCookingTime: "90",
            inPantry: true,
        });

        await openPanel();
        await userEvent.click(
            screen.getByRole("button", { name: "Reset filters" }),
        );

        expect(setSelectedTypes).toHaveBeenCalledWith([]);
        expect(setMinCookingTime).toHaveBeenCalledWith("");
        expect(setMaxCookingTime).toHaveBeenCalledWith("");
        expect(setSortOrder).toHaveBeenCalledWith("asc");
        expect(setInPantry).toHaveBeenCalledWith(false);
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
                    setSelectedTypes={jest.fn()}
                    setMinCookingTime={jest.fn()}
                    setMaxCookingTime={jest.fn()}
                    setSortOrder={jest.fn()}
                    setInPantry={jest.fn()}
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
