import { act } from "@testing-library/react";

import type { ExpiredPantryIngredient } from "types/expiry";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { useExpiredIngredientsActions } from "hooks/useExpiredIngredientsActions";

import { makeAxiosError, mockedPost } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const MODAL_ID = "expired-notice";

const MILK: ExpiredPantryIngredient = {
    ingredientId: 1,
    slug: "milk",
    name: "Milk",
    unitName: "l",
    lots: [
        {
            purchaseId: 101,
            quantity: 1,
            purchaseDate: "2026-06-01",
            expiryDate: "2026-06-06",
        },
        {
            purchaseId: 102,
            quantity: 2,
            purchaseDate: "2026-06-03",
            expiryDate: "2026-06-08",
        },
    ],
};
const YOGURT: ExpiredPantryIngredient = {
    ingredientId: 2,
    slug: "yogurt",
    name: "Yogurt",
    unitName: "g",
    lots: [
        {
            purchaseId: 205,
            quantity: 500,
            purchaseDate: "2026-06-02",
            expiryDate: "2026-06-09",
        },
    ],
};

const setup = () =>
    renderHookWithStore(
        () => useExpiredIngredientsActions(MODAL_ID, [MILK, YOGURT]),
        makeTestStore({
            ui: {
                queue: [
                    {
                        id: MODAL_ID,
                        type: MODAL_TYPE.expiredIngredients,
                        ingredients: [MILK, YOGURT],
                    },
                ],
            },
        }),
    );

describe("useExpiredIngredientsActions", () => {
    it("should throw out every expired lot, close the notice and confirm", async () => {
        mockedPost.mockResolvedValue({ data: { discarded: 3 } });
        const { result, store } = setup();

        act(() => {
            result.current.discard();
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.discard,
            { purchaseIds: [101, 102, 205] },
        );
        expect(selectActiveModal(store.getState())).toBeNull();
        expect(store.getState().notifications.items).toContainEqual(
            expect.objectContaining({
                type: "success",
                message: "Expired purchases thrown out",
            }),
        );
    });

    it("should keep the notice open when throwing out fails", async () => {
        mockedPost.mockRejectedValue(makeAxiosError(500, "Server error"));
        const { result, store } = setup();

        act(() => {
            result.current.discard();
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(selectActiveModal(store.getState())).toEqual(
            expect.objectContaining({ id: MODAL_ID }),
        );
    });

    it("should put each ingredient on the shopping list by name, leaving the amount to the shopper", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const { result } = setup();

        act(() => {
            result.current.addToShoppingList();
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.ingredients,
            {
                items: [
                    { ingredient_id: 1, quantity: null },
                    { ingredient_id: 2, quantity: null },
                ],
            },
        );
    });
});
