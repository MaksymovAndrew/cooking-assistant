import type { ShoppingListItem } from "types/shoppingList";

import { API_ROUTES } from "api/endpoints";

import { shoppingListApi } from "redux/services/shoppingListApi";

import { mockedGet, mockedPatch, mockedPut } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const item = (id: number, checked = false): ShoppingListItem => ({
    id,
    name: `Item ${id}`,
    note: null,
    ingredient_id: null,
    ingredient_slug: null,
    unit_name: null,
    quantity: null,
    checked,
    position: id,
});

const loadList = async (items: ShoppingListItem[]) => {
    mockedGet.mockResolvedValue({ data: items });
    const store = makeTestStore();

    await store.dispatch(
        shoppingListApi.endpoints.getShoppingList.initiate(null),
    );

    return store;
};

// joins the refetch a mutation's invalidation started, so the cache is read after it lands
const settleList = () =>
    shoppingListApi.endpoints.getShoppingList.initiate(null);

const cachedList = (store: ReturnType<typeof makeTestStore>) =>
    shoppingListApi.endpoints.getShoppingList.select(null)(store.getState())
        .data;

describe("shoppingListApi", () => {
    it("should fetch the shopping list", async () => {
        const store = await loadList([item(1)]);

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.shoppingList.list, {
            params: undefined,
        });
        expect(cachedList(store)).toEqual([item(1)]);
    });

    it("should refetch the list once a tick is saved, so an overlapping refetch cannot leave it stale", async () => {
        const store = await loadList([item(1)]);

        mockedPatch.mockResolvedValue({ data: item(1, true) });
        mockedGet.mockResolvedValue({ data: [item(1, true)] });
        await store.dispatch(
            shoppingListApi.endpoints.setShoppingListItemChecked.initiate({
                id: 1,
                checked: true,
            }),
        );
        await store.dispatch(settleList());

        expect(mockedPatch).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.byId(1),
            { checked: true },
        );
        expect(mockedGet).toHaveBeenCalledTimes(2);
        expect(cachedList(store)?.[0].checked).toBe(true);
    });

    it("should roll the tick back when the request fails", async () => {
        const store = await loadList([item(1)]);

        mockedPatch.mockRejectedValue(new Error("offline"));
        await store.dispatch(
            shoppingListApi.endpoints.setShoppingListItemChecked.initiate({
                id: 1,
                checked: true,
            }),
        );

        expect(cachedList(store)?.[0].checked).toBe(false);
    });

    it("should reorder the cached list at once and refetch it after the request", async () => {
        const store = await loadList([item(1), item(2)]);

        mockedPut.mockResolvedValue({ data: null });
        const request = store.dispatch(
            shoppingListApi.endpoints.reorderShoppingList.initiate({
                ids: [2, 1],
            }),
        );

        expect(cachedList(store)?.map((entry) => entry.id)).toEqual([2, 1]);

        mockedGet.mockResolvedValue({ data: [item(2), item(1)] });
        await request;
        await store.dispatch(settleList());

        expect(mockedGet).toHaveBeenCalledTimes(2);
        expect(cachedList(store)?.map((entry) => entry.id)).toEqual([2, 1]);
    });

    it("should undo a failed reorder and refetch the list", async () => {
        const store = await loadList([item(1), item(2)]);

        mockedPut.mockRejectedValue(new Error("conflict"));
        await store.dispatch(
            shoppingListApi.endpoints.reorderShoppingList.initiate({
                ids: [2, 1],
            }),
        );
        await store.dispatch(settleList());

        expect(mockedGet).toHaveBeenCalledTimes(2);
        expect(cachedList(store)?.map((entry) => entry.id)).toEqual([1, 2]);
    });
});
