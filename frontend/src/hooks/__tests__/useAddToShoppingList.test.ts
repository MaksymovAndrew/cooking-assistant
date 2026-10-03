import { act } from "@testing-library/react";

import { ROUTES } from "constants/routes";

import { API_ROUTES } from "api/endpoints";

import { useAddToShoppingList } from "hooks/useAddToShoppingList";

import { makeAxiosError, mockedPost } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const MILK = { ingredient_id: 4, quantity: 2 };
const EGGS = { ingredient_id: 9, quantity: null };

describe("useAddToShoppingList", () => {
    it("should send the ingredients and confirm with a link to the list", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const { result, store } = renderHookWithStore(() =>
            useAddToShoppingList(),
        );

        act(() => {
            result.current.add([MILK, EGGS]);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.ingredients,
            { items: [MILK, EGGS] },
        );
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "success",
                message: "Added to your shopping list.",
                link: { href: ROUTES.shoppingList, label: "Open list" },
            }),
        ]);
    });

    it("should send nothing for an empty selection", () => {
        const { result } = renderHookWithStore(() => useAddToShoppingList());

        act(() => {
            result.current.add([]);
        });

        expect(mockedPost).not.toHaveBeenCalled();
    });

    it("should ignore a second press while the first is still on its way", async () => {
        mockedPost.mockReturnValue(new Promise(() => undefined));
        const { result } = renderHookWithStore(() => useAddToShoppingList());

        act(() => {
            result.current.add([MILK]);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.isAdding).toBe(true);

        act(() => {
            result.current.add([MILK]);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedPost).toHaveBeenCalledTimes(1);
    });

    it("should not confirm an add that failed", async () => {
        mockedPost.mockRejectedValue(makeAxiosError(500, "Server error"));
        const { result, store } = renderHookWithStore(() =>
            useAddToShoppingList(),
        );

        act(() => {
            result.current.add([MILK]);
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(store.getState().notifications.items).not.toContainEqual(
            expect.objectContaining({ type: "success" }),
        );
        expect(result.current.isAdding).toBe(false);
    });
});
