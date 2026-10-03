import { act } from "@testing-library/react";

import type { Ingredient } from "types/ingredient";

import { API_ROUTES } from "api/endpoints";

import { useAddPantryIngredients } from "hooks/useAddPantryIngredients";

import { mockedPut } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const CATALOG: Ingredient[] = [
    {
        id: 2,
        slug: "onion",
        name: "Onion",
        category: "vegetables",
        unit_name: "g",
        allergens: [],
        days_to_expire: 30,
        calories_per_unit: null,
    },
    {
        id: 1,
        slug: "carrot",
        name: "Carrot",
        category: "vegetables",
        unit_name: "g",
        allergens: [],
        days_to_expire: 14,
        calories_per_unit: null,
    },
];

const onSaved = jest.fn();

const setup = () =>
    renderHookWithStore(() => useAddPantryIngredients(CATALOG, onSaved));

describe("useAddPantryIngredients", () => {
    it("should toggle a catalog ingredient's selected state", () => {
        const { result } = setup();

        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        expect(result.current.selectedIngredients).toContain(2);

        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        expect(result.current.selectedIngredients).not.toContain(2);
    });

    it("should save each newly selected ingredient with its own real quantity, not a hardcoded default", async () => {
        mockedPut.mockResolvedValue({ data: null });

        const { result } = setup();

        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        await act(async () => {
            await result.current.confirm({ 2: 7 });
        });

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.list,
            {
                ingredients: [
                    {
                        id: 2,
                        ingredient_name: "Onion",
                        quantity_person_ingradient: 7,
                    },
                ],
            },
        );
        expect(onSaved).toHaveBeenCalledTimes(1);
    });

    it("should default to a quantity of 1 for a selected ingredient missing from the quantities map", async () => {
        mockedPut.mockResolvedValue({ data: null });

        const { result } = setup();

        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        await act(async () => {
            await result.current.confirm({});
        });

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.list,
            {
                ingredients: [
                    {
                        id: 2,
                        ingredient_name: "Onion",
                        quantity_person_ingradient: 1,
                    },
                ],
            },
        );
    });

    it("should stay open when the save fails", async () => {
        mockedPut.mockRejectedValue(new Error("offline"));

        const { result } = setup();

        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        await act(async () => {
            await result.current.confirm({ 2: 3 });
        });

        expect(onSaved).not.toHaveBeenCalled();
        expect(result.current.selectedIngredients).toEqual([2]);
    });
});
