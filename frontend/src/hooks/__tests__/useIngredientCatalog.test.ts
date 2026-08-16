import { act } from "@testing-library/react";

import type { Ingredient } from "types/ingredient";
import type { UserIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { ingredientsApi } from "redux/services/ingredientsApi";
import { userIngredientsApi } from "redux/services/userIngredientsApi";

import { useIngredientCatalog } from "hooks/useIngredientCatalog";

import { mockedPut, mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

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
const OWNED: UserIngredient = {
    ingredient_id: 1,
    ingredient_slug: "carrot",
    ingredient_name: "Carrot",
    category: "vegetables",
    unit_name: "g",
    quantity_person_ingradient: 2,
    allergens: [],
    lots: [],
};

const setup = async (pantry: UserIngredient[] = [OWNED]) => {
    mockGetByUrl({
        [API_ROUTES.ingredients.list]: CATALOG,
        [API_ROUTES.userIngredients.list]: pantry,
    });

    const store = makeTestStore();

    await Promise.all([
        store.dispatch(ingredientsApi.endpoints.getIngredients.initiate(null)),
        store.dispatch(
            userIngredientsApi.endpoints.getUserIngredients.initiate(null),
        ),
    ]);

    return renderHookWithStore(() => useIngredientCatalog(), store);
};

describe("useIngredientCatalog", () => {
    it("should sort the catalog by name and map the pantry's ingredient_id to id", async () => {
        const { result } = await setup();

        expect(result.current.allIngredients.map((i) => i.name)).toEqual([
            "Carrot",
            "Onion",
        ]);
        expect(result.current.personIngredients[0].id).toBe(1);
    });

    it("should toggle a catalog ingredient's selected state", async () => {
        const { result } = await setup();

        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        expect(result.current.selectedIngredients).toContain(2);

        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        expect(result.current.selectedIngredients).not.toContain(2);
    });

    it("should open the add-ingredient flow with an empty selection", async () => {
        const { result } = await setup();

        act(() => {
            result.current.toggleIngredientSelection(2);
        });
        act(() => {
            result.current.handleOpenAddModal();
        });

        expect(result.current.isAdding).toBe(true);
        expect(result.current.selectedIngredients).toEqual([]);
    });

    it("should save each newly selected ingredient with its own real quantity, not a hardcoded default", async () => {
        mockedPut.mockResolvedValue({ data: null });

        const { result } = await setup();

        act(() => {
            result.current.handleOpenAddModal();
        });
        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        await act(async () => {
            await result.current.handleConfirmAddIngredients({ 2: 7 });
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
        expect(result.current.isAdding).toBe(false);
    });

    it("should default to a quantity of 1 for a selected ingredient missing from the quantities map", async () => {
        mockedPut.mockResolvedValue({ data: null });

        const { result } = await setup();

        act(() => {
            result.current.handleOpenAddModal();
        });
        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        await act(async () => {
            await result.current.handleConfirmAddIngredients({});
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

    it("should reset the selection and leave the add flow without saving when cancelled", async () => {
        const { result } = await setup();

        act(() => {
            result.current.handleOpenAddModal();
        });
        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        expect(result.current.selectedIngredients).toContain(2);

        act(() => {
            result.current.handleCancelAdd();
        });

        expect(result.current.isAdding).toBe(false);
        expect(result.current.selectedIngredients).toEqual([]);
    });
});
