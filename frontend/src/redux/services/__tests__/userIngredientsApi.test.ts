import type {
    Purchase,
    SaveUserIngredientsRequest,
    UpdatePurchaseRequest,
    UserIngredient,
} from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { userIngredientsApi } from "redux/services/userIngredientsApi";

import { mockedDelete, mockedGet, mockedPut } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const PANTRY: UserIngredient[] = [
    {
        ingredient_id: 1,
        ingredient_slug: "salt",
        ingredient_name: "Salt",
        category: "spices",
        unit_name: "g",
        quantity_person_ingradient: 5,
        allergens: [],
        lots: [],
    },
];
const HISTORY: Purchase[] = [
    {
        id: 9,
        quantity: 2,
        purchase_date: "2024-01-01",
        unit_name: "g",
        days_to_expire: 30,
    },
];
const SAVE: SaveUserIngredientsRequest = {
    ingredients: [
        { id: 1, ingredient_name: "Salt", quantity_person_ingradient: 1 },
    ],
};
const PURCHASE: UpdatePurchaseRequest = { quantity: 4 };

describe("userIngredientsApi", () => {
    it("should fetch the pantry", async () => {
        mockedGet.mockResolvedValue({ data: PANTRY });
        const store = makeTestStore();

        const result = await store.dispatch(
            userIngredientsApi.endpoints.getUserIngredients.initiate(null),
        );

        expect(mockedGet).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.list,
            {
                params: undefined,
            },
        );
        expect(result.data).toEqual(PANTRY);
    });

    it("should fetch the purchase history of an ingredient", async () => {
        mockedGet.mockResolvedValue({ data: HISTORY });
        const store = makeTestStore();

        const result = await store.dispatch(
            userIngredientsApi.endpoints.getPurchaseHistory.initiate(1),
        );

        expect(mockedGet).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.history(1),
            { params: undefined },
        );
        expect(result.data).toEqual(HISTORY);
    });

    it("should save pantry ingredients", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            userIngredientsApi.endpoints.saveUserIngredient.initiate(SAVE),
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.list,
            SAVE,
        );
    });

    it("should delete a pantry ingredient", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            userIngredientsApi.endpoints.deleteUserIngredient.initiate(1),
        );

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.item(1),
            { params: undefined },
        );
    });

    it("should update a purchase", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            userIngredientsApi.endpoints.updatePurchase.initiate({
                purchaseId: 9,
                body: PURCHASE,
            }),
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.history(9),
            PURCHASE,
        );
    });
});
