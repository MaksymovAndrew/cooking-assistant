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
    { id: 2, name: "Onion", unit_name: "g" },
    { id: 1, name: "Carrot", unit_name: "g" },
];
const OWNED: UserIngredient = {
    ingredient_id: 1,
    ingredient_name: "Carrot",
    unit_name: "g",
    quantity_person_ingradient: 2,
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

    it("should enter edit mode on the first call and save new selections on the second", async () => {
        mockedPut.mockResolvedValue({ data: null });

        const { result } = await setup();

        await act(async () => {
            await result.current.handleSaveOrToggleEdit();
        });

        expect(result.current.isEditing).toBe(true);

        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        await act(async () => {
            await result.current.handleSaveOrToggleEdit();
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
        expect(result.current.isEditing).toBe(false);
    });

    it("should reset the selection and leave edit mode without saving when cancelled", async () => {
        const { result } = await setup();

        await act(async () => {
            await result.current.handleSaveOrToggleEdit();
        });
        act(() => {
            result.current.toggleIngredientSelection(2);
        });

        expect(result.current.selectedIngredients).toContain(2);

        act(() => {
            result.current.handleCancelEdit();
        });

        expect(result.current.isEditing).toBe(false);
        expect(result.current.selectedIngredients).toEqual([1]);
    });

    it("should stamp a purchase date only when a quantity is increased", async () => {
        const { result } = await setup();

        act(() => {
            result.current.handleToggleQuantityEdit();
        });

        expect(result.current.isEditingQuantity).toBe(true);
        expect(
            result.current.updatedIngredients[0].purchase_date,
        ).toBeUndefined();

        act(() => {
            result.current.handleQuantityChange(1, 5);
        });

        expect(
            result.current.updatedIngredients[0].purchase_date,
        ).toBeDefined();
    });

    it("should send only the changed ingredients when saving updated quantities", async () => {
        mockedPut.mockResolvedValue({ data: null });

        const { result } = await setup();

        act(() => {
            result.current.handleToggleQuantityEdit();
        });
        act(() => {
            result.current.handleQuantityChange(1, 9);
        });

        await act(async () => {
            await result.current.saveUpdatedQuantities();
        });

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.updateQuantities,
            {
                updatedIngredients: [
                    expect.objectContaining({
                        id: 1,
                        quantity_person_ingradient: 9,
                    }),
                ],
            },
        );
        expect(result.current.isEditingQuantity).toBe(false);
    });
});
