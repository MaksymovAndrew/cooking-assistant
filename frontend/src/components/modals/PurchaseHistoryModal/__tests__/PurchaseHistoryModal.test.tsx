import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Purchase } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { userIngredientsApi } from "redux/services/userIngredientsApi";

import { PurchaseHistoryModal } from "components/modals/PurchaseHistoryModal";

import { mockedGet, mockedPut } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const SAMPLE_HISTORY: Purchase[] = [
    {
        id: 1,
        quantity: 500,
        purchase_date: "2025-01-01T00:00:00.000Z",
        unit_name: "g",
        days_to_expire: 365,
    },
];

const HISTORY_A: Purchase = {
    id: 1,
    quantity: 500,
    purchase_date: "2025-01-01T00:00:00.000Z",
    unit_name: "g",
    days_to_expire: 365,
};
const HISTORY_B: Purchase = {
    id: 2,
    quantity: 200,
    purchase_date: "2025-01-02T00:00:00.000Z",
    unit_name: "ml",
    days_to_expire: 90,
};

const editRowQuantity = async (row: HTMLElement, newValue: string) => {
    await userEvent.click(
        within(row).getByRole("button", { name: "Edit quantity" }),
    );

    const input = within(row).getByRole("spinbutton");

    await userEvent.clear(input);
    await userEvent.type(input, newValue);

    return input;
};

describe("PurchaseHistoryModal", () => {
    it("should render purchase history loaded from the api", async () => {
        mockedGet.mockResolvedValue({ data: SAMPLE_HISTORY });

        renderWithRouter(
            <PurchaseHistoryModal
                ingredientId={5}
                ingredientName="Potato"
                onClose={jest.fn()}
            />,
        );

        expect(
            await screen.findByText("Purchase History: Potato"),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Close" }),
        ).toBeInTheDocument();
    });

    it("should show an error message when the history fails to load", async () => {
        mockedGet.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: "Server error" } },
            message: "Request failed",
        });

        renderWithRouter(
            <PurchaseHistoryModal
                ingredientId={5}
                ingredientName="Potato"
                onClose={jest.fn()}
            />,
        );

        expect(await screen.findByText("Server error")).toBeInTheDocument();
        expect(
            screen.queryByText("No purchase history"),
        ).not.toBeInTheDocument();
    });

    it("should save an edited quantity to the correct purchase's history endpoint", async () => {
        mockedGet.mockResolvedValue({ data: SAMPLE_HISTORY });
        mockedPut.mockResolvedValue({ data: null });

        renderWithRouter(
            <PurchaseHistoryModal
                ingredientId={5}
                ingredientName="Potato"
                onClose={jest.fn()}
            />,
        );

        const row = (await screen.findAllByRole("listitem"))[0];

        await editRowQuantity(row, "600");
        await userEvent.tab();

        expect(
            await screen.findByRole("button", { name: "Edit quantity" }),
        ).toBeInTheDocument();
        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.history(SAMPLE_HISTORY[0].id),
            { quantity: 600 },
        );
    });

    it("should not overwrite an unsaved edit in another row once a Pantry-tag refetch lands", async () => {
        // the refetch must return content that actually differs from the initial fetch (A's
        // quantity reflecting the concurrent save below) - RTK Query's structural sharing keeps
        // the old `data` reference (and this effect never re-fires) when a refetch's content is
        // identical to what's already cached, which would make this test pass for the wrong reason
        mockedGet
            .mockResolvedValueOnce({ data: [HISTORY_A, HISTORY_B] })
            .mockResolvedValue({
                data: [{ ...HISTORY_A, quantity: 600 }, HISTORY_B],
            });
        mockedPut.mockResolvedValue({ data: null });

        const { store } = renderWithRouter(
            <PurchaseHistoryModal
                ingredientId={5}
                ingredientName="Potato"
                onClose={jest.fn()}
            />,
        );

        const [, rowB] = await screen.findAllByRole("listitem");

        await editRowQuantity(rowB, "250");

        // simulates another purchase being saved concurrently (e.g. another row, another tab):
        // invalidates the shared Pantry tag and refetches this modal's still-mounted history query
        await store.dispatch(
            userIngredientsApi.endpoints.updatePurchase.initiate({
                purchaseId: HISTORY_A.id,
                body: { quantity: 600 },
            }),
        );

        // the refetch triggered by the invalidation above is a detached dispatch, not part of the
        // mutation promise just awaited - give it a tick to land before asserting the guard held
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(within(rowB).getByDisplayValue("250")).toBeInTheDocument();
    });
});
