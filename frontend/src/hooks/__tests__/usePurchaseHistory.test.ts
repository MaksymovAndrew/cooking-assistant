import { act } from "@testing-library/react";

import type { Purchase } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { userIngredientsApi } from "redux/services/userIngredientsApi";

import { usePurchaseHistory } from "hooks/usePurchaseHistory";

import { mockedDelete, mockedGet, mockedPut } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const INGREDIENT_ID = 5;
const LOT_A: Purchase = {
    id: 1,
    quantity: 500,
    purchase_date: "2025-01-01T00:00:00.000Z",
    unit_name: "g",
    days_to_expire: 365,
};
const LOT_B: Purchase = { ...LOT_A, id: 2, quantity: 200 };

const setup = async (history: Purchase[] = [LOT_A, LOT_B]) => {
    mockedGet.mockResolvedValue({ data: history });

    const store = makeTestStore();
    const onEmptied = jest.fn();

    await store.dispatch(
        userIngredientsApi.endpoints.getPurchaseHistory.initiate(INGREDIENT_ID),
    );

    const view = renderHookWithStore(
        () => usePurchaseHistory(INGREDIENT_ID, onEmptied),
        store,
    );

    return { ...view, onEmptied };
};

describe("usePurchaseHistory", () => {
    it("should seed the editable lots from the loaded history", async () => {
        const { result } = await setup();

        expect(result.current.items).toEqual([LOT_A, LOT_B]);
        expect(result.current.hasHistory).toBe(true);
        expect(result.current.isEmpty).toBe(false);
    });

    it("should keep a saved quantity", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const { result } = await setup();

        act(() => {
            result.current.changeQuantity(LOT_A.id, 600);
        });
        await act(async () => {
            await result.current.save(LOT_A.id, 600);
        });

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.history(LOT_A.id),
            { quantity: 600 },
        );
        expect(result.current.items[0].quantity).toBe(600);
    });

    it("should put the last saved quantity back when a save fails", async () => {
        mockedPut
            .mockResolvedValueOnce({ data: null })
            .mockRejectedValueOnce(new Error("offline"));
        const { result } = await setup();

        await act(async () => {
            await result.current.save(LOT_A.id, 600);
        });
        act(() => {
            result.current.changeQuantity(LOT_A.id, 700);
        });
        await act(async () => {
            await result.current.save(LOT_A.id, 700);
        });

        expect(result.current.items[0].quantity).toBe(600);
        expect(result.current.items[1]).toEqual(LOT_B);
    });

    it("should keep the lot when its delete fails", async () => {
        mockedDelete.mockRejectedValue(new Error("offline"));
        const { result, onEmptied } = await setup([LOT_A]);

        await act(async () => {
            result.current.remove(LOT_A.id);
            await Promise.resolve();
        });

        expect(result.current.items).toEqual([LOT_A]);
        expect(onEmptied).not.toHaveBeenCalled();
    });

    it("should report emptied once the last lot is deleted", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { result, onEmptied } = await setup([LOT_A]);

        await act(async () => {
            result.current.remove(LOT_A.id);
            await Promise.resolve();
        });

        expect(result.current.items).toEqual([]);
        expect(onEmptied).toHaveBeenCalledTimes(1);
    });

    it("should drop both lots when two deletes are in flight at once", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { result, onEmptied } = await setup();

        await act(async () => {
            result.current.remove(LOT_A.id);
            result.current.remove(LOT_B.id);
            await Promise.resolve();
        });

        expect(result.current.items).toEqual([]);
        expect(onEmptied).toHaveBeenCalledTimes(1);
    });
});
