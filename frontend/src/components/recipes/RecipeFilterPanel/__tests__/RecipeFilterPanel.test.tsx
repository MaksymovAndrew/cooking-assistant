import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Ingredient } from "types/ingredient";

import { RecipeFilterPanel } from "components/recipes/RecipeFilterPanel";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

import { renderWithRouter } from "test/router";

const SOUP_TYPE = { id: 1, type_name: "Soup", description: "" };
const DESSERT_TYPE = { id: 2, type_name: "Dessert", description: "" };

const TOMATO: Ingredient = {
    id: 9,
    slug: "tomato",
    name: "Tomato",
    category: "vegetables",
    unit_name: "pcs",
    allergens: [],
    days_to_expire: 7,
    calories_per_unit: null,
};

const BASE_FILTERS: RecipeFilterState = {
    search: "",
    types: [],
    ingredients: [],
    cookingTime: { min: "", max: "" },
    sort: null,
    inPantry: false,
};

const setup = (
    overrides: Partial<RecipeFilterState> = {},
    activeCount = 0,
    ingredientCatalog: Ingredient[] = [],
) => {
    const setValue = jest.fn();
    const setValues = jest.fn();

    renderWithRouter(
        <RecipeFilterPanel
            filters={{ ...BASE_FILTERS, ...overrides }}
            setValue={setValue}
            setValues={setValues}
            activeCount={activeCount}
            types={[SOUP_TYPE, DESSERT_TYPE]}
            ingredients={ingredientCatalog}
            searchPlaceholder="Search recipes"
            total={5}
        />,
    );

    return { setValue, setValues };
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

    it("should call setValue with the typed term, debounced, when the search field changes", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });

        try {
            const { setValue } = setup();

            await user.type(
                screen.getByPlaceholderText(/search recipes/i),
                "Tomato",
            );

            // still debouncing - not committed to the URL yet
            expect(setValue).not.toHaveBeenCalled();

            act(() => {
                jest.advanceTimersByTime(300);
            });

            expect(setValue).toHaveBeenCalledWith("search", "Tomato", {
                replace: true,
            });
        } finally {
            jest.useRealTimers();
        }
    });

    it("should call setValue with the updated range, debounced, when the time inputs change", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });

        try {
            const { setValue } = setup();

            await user.click(screen.getByRole("button", { name: /Filters/ }));
            await user.type(screen.getByLabelText("Min"), "5");

            // still debouncing - not committed to the URL yet
            expect(setValue).not.toHaveBeenCalled();

            act(() => {
                jest.advanceTimersByTime(300);
            });

            expect(setValue).toHaveBeenCalledWith(
                "cookingTime",
                { min: "5", max: "" },
                { replace: true },
            );
        } finally {
            jest.useRealTimers();
        }
    });

    it("should call setValue with the updated range, debounced, when the max time input changes", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });

        try {
            const { setValue } = setup();

            await user.click(screen.getByRole("button", { name: /Filters/ }));
            await user.type(screen.getByLabelText("Max"), "45");

            expect(setValue).not.toHaveBeenCalled();

            act(() => {
                jest.advanceTimersByTime(300);
            });

            expect(setValue).toHaveBeenCalledWith(
                "cookingTime",
                { min: "", max: "45" },
                { replace: true },
            );
        } finally {
            jest.useRealTimers();
        }
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

    it("should call setValue with the selected ingredient id when one is picked in the popover", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });

        try {
            const { setValue } = setup({}, 0, [TOMATO]);

            await user.click(screen.getByRole("button", { name: /Filters/ }));
            await user.type(
                screen.getByPlaceholderText(/ingredient/i),
                "Tomato",
            );

            act(() => {
                jest.advanceTimersByTime(300);
            });

            await user.click(screen.getByRole("button", { name: "Tomato" }));

            expect(setValue).toHaveBeenCalledWith("ingredients", [TOMATO.id]);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should call setValue with true when the pantry toggle is clicked", async () => {
        const { setValue } = setup();

        await openPanel();
        await userEvent.click(screen.getByRole("switch"));

        expect(setValue).toHaveBeenCalledWith("inPantry", true);
    });

    it("should reset only the popover's own fields when Reset filters is clicked, leaving search alone", async () => {
        const { setValue, setValues } = setup(
            { types: [1], inPantry: true },
            2,
        );

        await openPanel();
        await userEvent.click(
            screen.getByRole("button", { name: "Reset filters" }),
        );

        // one combined call, not five separate setValue() calls - each of those would
        // read the same pre-reset URL state, so only the last one would actually stick
        expect(setValues).toHaveBeenCalledWith({
            types: [],
            ingredients: [],
            cookingTime: { min: "", max: "" },
            sort: null,
            inPantry: false,
        });
        expect(setValue).not.toHaveBeenCalledWith(
            "search",
            expect.anything(),
            expect.anything(),
        );
    });

    it("should not let a pending, uncommitted Min edit commit after Reset filters is clicked", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });

        try {
            const { setValue } = setup();

            await user.click(screen.getByRole("button", { name: /Filters/ }));
            await user.type(screen.getByLabelText("Min"), "5");
            // debounce still pending - Reset filters doesn't close the popover
            await user.click(
                screen.getByRole("button", { name: "Reset filters" }),
            );

            act(() => {
                jest.advanceTimersByTime(300);
            });

            expect(setValue).not.toHaveBeenCalledWith(
                "cookingTime",
                expect.anything(),
                expect.anything(),
            );
        } finally {
            jest.useRealTimers();
        }
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
                    setValues={jest.fn()}
                    activeCount={0}
                    types={[]}
                    ingredients={[]}
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
