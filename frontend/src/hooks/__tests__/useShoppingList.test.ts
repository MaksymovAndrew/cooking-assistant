import { act } from "@testing-library/react";

import type { ShoppingListItem } from "types/shoppingList";

import { API_ROUTES } from "api/endpoints";

import { shoppingListApi } from "redux/services/shoppingListApi";

import { useShoppingList } from "hooks/useShoppingList";

import {
    makeAxiosError,
    mockedDelete,
    mockedPatch,
    mockedPost,
    mockedPut,
    mockGetByUrl,
} from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const item = (id: number, name: string, checked = false): ShoppingListItem => ({
    id,
    name,
    note: null,
    ingredient_id: null,
    ingredient_slug: null,
    unit_name: null,
    quantity: null,
    checked,
    position: id,
});

const BREAD = item(1, "Bread");
const MILK = item(2, "Milk", true);
const EGGS = item(3, "Eggs");
const BUTTER = item(4, "Butter");

const setup = async (
    items: ShoppingListItem[] = [BREAD, MILK, EGGS, BUTTER],
) => {
    mockGetByUrl({ [API_ROUTES.shoppingList.list]: items });

    const store = makeTestStore();

    await store.dispatch(
        shoppingListApi.endpoints.getShoppingList.initiate(null),
    );

    return renderHookWithStore(() => useShoppingList(), store);
};

describe("useShoppingList", () => {
    it("should split the list into what is still to buy and what is bought", async () => {
        const { result } = await setup();

        expect(result.current.toBuy).toEqual([BREAD, EGGS, BUTTER]);
        expect(result.current.bought).toEqual([MILK]);
        expect(result.current.total).toBe(4);
        expect(result.current.isEmpty).toBe(false);
    });

    it("should report an empty list", async () => {
        const { result } = await setup([]);

        expect(result.current.isEmpty).toBe(true);
        expect(result.current.layoutKey).toBe("");
    });

    it("should save a new item trimmed, with an empty note left out", async () => {
        mockedPost.mockResolvedValue({ data: item(5, "Flour") });
        const { result } = await setup();
        let isSaved = false;

        await act(async () => {
            isSaved = await result.current.add("  Flour ", "   ");
        });

        expect(isSaved).toBe(true);
        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.shoppingList.list, {
            name: "Flour",
            note: null,
        });
    });

    it("should tell the form an item was not saved", async () => {
        mockedPost.mockRejectedValue(makeAxiosError(500, "Server error"));
        const { result } = await setup();
        let isSaved = true;

        await act(async () => {
            isSaved = await result.current.add("Flour", "for bread");
        });

        expect(isSaved).toBe(false);
    });

    it("should tick an item to buy and untick a bought one", async () => {
        mockedPatch.mockResolvedValue({ data: null });
        const { result } = await setup();

        act(() => {
            result.current.toggle(BREAD);
            result.current.toggle(MILK);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedPatch).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.byId(1),
            { checked: true },
        );
        expect(mockedPatch).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.byId(2),
            { checked: false },
        );
    });

    it("should clear the bought items in one request", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { result } = await setup();

        act(() => {
            result.current.clearBought();
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.checked,
            { data: undefined, params: undefined },
        );
    });

    it("should swap an item with its neighbour and keep bought items at the end", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const { result } = await setup();

        act(() => {
            result.current.move(EGGS, -1);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.shoppingList.order, {
            ids: [3, 1, 4, 2],
        });
    });

    it.each([
        ["the first item up", BREAD, -1],
        ["the last item down", BUTTER, 1],
        ["a bought item", MILK, 1],
    ] as const)("should not move %s", async (_label, target, direction) => {
        const { result } = await setup();

        act(() => {
            result.current.move(target, direction);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedPut).not.toHaveBeenCalled();
    });

    it("should change the layout key as soon as an item moves", async () => {
        mockedPut.mockReturnValue(new Promise(() => undefined));
        const { result } = await setup();
        const before = result.current.layoutKey;

        act(() => {
            result.current.move(BREAD, 1);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(before).toBe("1:false,3:false,4:false,2:true");
        expect(result.current.layoutKey).toBe("3:false,1:false,4:false,2:true");
    });
});
