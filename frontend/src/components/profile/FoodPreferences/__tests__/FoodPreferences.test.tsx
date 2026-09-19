import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Ingredient } from "types/ingredient";

import { API_ROUTES } from "api/endpoints";

import { FoodPreferences } from "components/profile/FoodPreferences";

import { mockedDelete, mockedPut, mockGetByUrl } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const SEARCH_PLACEHOLDER = "Search ingredients to avoid…";

const ingredient = (id: number, name: string): Ingredient => ({
    id,
    // not real catalog slugs, so the fixture name is shown rather than a catalog translation
    slug: `fixture-${id}`,
    name,
    category: "vegetables",
    unit_name: "pcs",
    allergens: [],
    days_to_expire: null,
    calories_per_unit: null,
});

const OLIVES = ingredient(1, "Olives");
const OLIVE_OIL = ingredient(2, "Olive oil");
const CORIANDER = ingredient(3, "Coriander");

const mockPreferences = (
    allergens: string[] = [],
    ingredientIds: number[] = [],
) => {
    mockGetByUrl({
        [API_ROUTES.dietPreferences.get]: {
            allergens,
            ingredient_ids: ingredientIds,
        },
        [API_ROUTES.ingredients.list]: [OLIVES, OLIVE_OIL, CORIANDER],
    });
};

const setup = (allergens: string[] = [], ingredientIds: number[] = []) => {
    mockPreferences(allergens, ingredientIds);

    return renderWithRouter(<FoodPreferences />);
};

const DEBOUNCE_MS = 300;
const ARIA_CHECKED = "aria-checked";
const EMPTY_LIST = "Nothing on your avoid list yet.";

const setupUser = () =>
    userEvent.setup({
        advanceTimers: (ms) => {
            jest.advanceTimersByTime(ms);
        },
    });

const typeSearch = async (query: string) => {
    jest.useFakeTimers();
    const user = setupUser();

    await user.type(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), query);
    act(() => {
        jest.advanceTimersByTime(DEBOUNCE_MS);
    });
    jest.useRealTimers();
};

describe("FoodPreferences", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it("should show what the user avoids with its counts", async () => {
        setup(["gluten", "milk"], [3]);

        expect(await screen.findByText("Coriander")).toBeInTheDocument();
        expect(screen.getByRole("checkbox", { name: "Milk" })).toHaveAttribute(
            ARIA_CHECKED,
            "true",
        );
        expect(screen.getByRole("checkbox", { name: "Eggs" })).toHaveAttribute(
            ARIA_CHECKED,
            "false",
        );
        expect(screen.getByText("2 of 14")).toBeInTheDocument();
        expect(
            screen.getByText("2 allergens · 1 ingredient"),
        ).toBeInTheDocument();
    });

    it("should save an allergen on tap and confirm it", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup();

        const gluten = await screen.findByRole("checkbox", { name: "Gluten" });

        mockPreferences(["gluten"]);
        await userEvent.click(gluten);

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.dietPreferences.allergen("gluten"),
            undefined,
        );
        expect(gluten).toHaveAttribute(ARIA_CHECKED, "true");
        expect(await screen.findByText("Saved just now")).toBeInTheDocument();
    });

    it("should put the chip back when the save fails", async () => {
        mockedPut.mockRejectedValue(new Error("offline"));
        setup();

        const gluten = await screen.findByRole("checkbox", { name: "Gluten" });

        await userEvent.click(gluten);

        expect(
            await screen.findByRole("checkbox", {
                name: "Gluten",
                checked: false,
            }),
        ).toBeInTheDocument();
        expect(screen.queryByText("Saved just now")).not.toBeInTheDocument();
    });

    it("should find an ingredient in the catalog and avoid it", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup([], [1]);

        await screen.findByText("Olives");
        mockPreferences([], [1, 2]);
        await typeSearch("oli");

        expect(screen.getByRole("button", { name: "Olives" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Olive oil" }),
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.ingredients.avoid(2),
            undefined,
        );
        expect(
            await screen.findByRole("button", {
                name: "Stop avoiding Olive oil",
            }),
        ).toBeInTheDocument();
    });

    it("should say when nothing in the catalog matches", async () => {
        setup();

        await screen.findByText(EMPTY_LIST);
        await typeSearch("quinoaa");

        expect(
            screen.getByText("No ingredients match “quinoaa”."),
        ).toBeInTheDocument();
    });

    it("should stop avoiding an ingredient from its chip", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        setup([], [3]);
        mockPreferences();

        await userEvent.click(
            await screen.findByRole("button", {
                name: "Stop avoiding Coriander",
            }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.ingredients.avoid(3),
            { data: undefined, params: undefined },
        );
        expect(await screen.findByText(EMPTY_LIST)).toBeInTheDocument();
    });
});
