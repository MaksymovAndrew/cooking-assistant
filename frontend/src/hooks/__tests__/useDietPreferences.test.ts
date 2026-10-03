import { act } from "@testing-library/react";

import type { Ingredient } from "types/ingredient";

import { API_ROUTES } from "api/endpoints";

import { dietPreferencesApi } from "redux/services/dietPreferencesApi";
import { ingredientsApi } from "redux/services/ingredientsApi";

import { useDietPreferences } from "hooks/useDietPreferences";

import { mockedDelete, mockedPut, mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const SAVED_INDICATOR_MS = 3000;

const ingredient = (id: number, name: string): Ingredient => ({
    id,
    // not real catalog slugs, so the fixture name is what gets sorted
    slug: `fixture-${id}`,
    name,
    category: "vegetables",
    unit_name: "pcs",
    allergens: [],
    days_to_expire: null,
    calories_per_unit: null,
});

const OLIVES = ingredient(1, "Olives");
const CORIANDER = ingredient(2, "Coriander");
const LEEK = ingredient(3, "Leek");

const setup = async (allergens: string[], ingredientIds: number[]) => {
    mockGetByUrl({
        [API_ROUTES.dietPreferences.get]: {
            allergens,
            ingredient_ids: ingredientIds,
        },
        [API_ROUTES.ingredients.list]: [OLIVES, CORIANDER, LEEK],
    });

    const store = makeTestStore();

    await Promise.all([
        store.dispatch(
            dietPreferencesApi.endpoints.getDietPreferences.initiate(null),
        ),
        store.dispatch(ingredientsApi.endpoints.getIngredients.initiate(null)),
    ]);

    return renderHookWithStore(() => useDietPreferences(), store);
};

afterEach(() => {
    jest.useRealTimers();
});

describe("useDietPreferences", () => {
    it("should not be ready before the avoid list has loaded", () => {
        mockGetByUrl({});

        const { result } = renderHookWithStore(() => useDietPreferences());

        expect(result.current.isReady).toBe(false);
        expect(result.current.allergens).toEqual([]);
    });

    it("should list the avoided catalog ingredients by name", async () => {
        const { result } = await setup(["milk"], [1, 2]);

        expect(result.current.isReady).toBe(true);
        expect(result.current.allergens).toEqual(["milk"]);
        expect(result.current.avoidedIngredients).toEqual([CORIANDER, OLIVES]);
    });

    it("should avoid an allergen not yet on the list and stop avoiding one that is", async () => {
        mockedPut.mockResolvedValue({ data: null });
        mockedDelete.mockResolvedValue({ data: null });
        const { result } = await setup(["milk"], []);

        act(() => {
            result.current.toggleAllergen("eggs");
            result.current.toggleAllergen("milk");
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.dietPreferences.allergen("eggs"),
            undefined,
        );
        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.dietPreferences.allergen("milk"),
            { data: undefined, params: undefined },
        );
    });

    it("should avoid an ingredient not yet on the list and stop avoiding one that is", async () => {
        mockedPut.mockResolvedValue({ data: null });
        mockedDelete.mockResolvedValue({ data: null });
        const { result } = await setup([], [1]);

        act(() => {
            result.current.toggleIngredient(LEEK);
            result.current.toggleIngredient(OLIVES);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.ingredients.avoid(LEEK.id),
            undefined,
        );
        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.ingredients.avoid(OLIVES.id),
            { data: undefined, params: undefined },
        );
    });

    it("should confirm a saved change for a few seconds", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const { result } = await setup([], []);

        jest.useFakeTimers();

        act(() => {
            result.current.toggleAllergen("eggs");
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.isSavedVisible).toBe(true);

        act(() => {
            jest.advanceTimersByTime(SAVED_INDICATOR_MS);
        });

        expect(result.current.isSavedVisible).toBe(false);
    });

    it("should not confirm a change that failed to save", async () => {
        mockedPut.mockRejectedValue(new Error("offline"));
        const { result } = await setup([], []);

        act(() => {
            result.current.toggleAllergen("eggs");
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.isSavedVisible).toBe(false);
    });
});
