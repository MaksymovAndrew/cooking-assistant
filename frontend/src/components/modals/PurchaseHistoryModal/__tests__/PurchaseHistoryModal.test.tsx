import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Purchase } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { userIngredientsApi } from "redux/services/userIngredientsApi";

import { PurchaseHistoryModal } from "components/modals/PurchaseHistoryModal";

import { mockedDelete, mockedGet, mockedPut } from "test/apiClientMock";
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

        const rows = await screen.findAllByRole("listitem");

        expect(
            screen.getByText("Purchase history: Potato"),
        ).toBeInTheDocument();
        expect(rows).toHaveLength(1);
        expect(within(rows[0]).getByText("500")).toBeInTheDocument();
        expect(within(rows[0]).getByText("g")).toBeInTheDocument();
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

    it("should put the saved quantity back when the save fails", async () => {
        mockedGet.mockResolvedValue({ data: SAMPLE_HISTORY });
        mockedPut.mockRejectedValue(new Error("offline"));

        renderWithRouter(
            <PurchaseHistoryModal
                ingredientId={5}
                ingredientName="Potato"
                onClose={jest.fn()}
            />,
        );

        const row = (await screen.findAllByRole("listitem"))[0];

        await editRowQuantity(row, "600");
        await userEvent.keyboard("{Enter}");

        expect(await within(row).findByText("500")).toBeInTheDocument();
        expect(within(row).queryByText("600")).not.toBeInTheDocument();
    });

    it("should not overwrite an unsaved edit in another row once a Pantry-tag refetch lands", async () => {
        // the refetch must differ, or RTK Query's structural sharing keeps `data` and the test proves nothing
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

        // a concurrent save elsewhere invalidates the Pantry tag and refetches this history
        await store.dispatch(
            userIngredientsApi.endpoints.updatePurchase.initiate({
                purchaseId: HISTORY_A.id,
                body: { quantity: 600 },
            }),
        );

        // the refetch is a detached dispatch, not part of the awaited mutation, so give it a tick
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(within(rowB).getByDisplayValue("250")).toBeInTheDocument();
    });

    it("should drop a deleted purchase from the list and keep the others", async () => {
        mockedGet.mockResolvedValue({ data: [HISTORY_A, HISTORY_B] });
        mockedDelete.mockResolvedValue({ data: null });
        const onClose = jest.fn();

        renderWithRouter(
            <PurchaseHistoryModal
                ingredientId={5}
                ingredientName="Potato"
                onClose={onClose}
            />,
        );

        const [rowA] = await screen.findAllByRole("listitem");

        await userEvent.click(
            within(rowA).getByRole("button", { name: "Delete purchase" }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.history(HISTORY_A.id),
            { data: undefined, params: undefined },
        );
        expect(screen.getAllByRole("listitem")).toHaveLength(1);
        expect(onClose).not.toHaveBeenCalled();
    });

    it("should close once the last purchase is deleted", async () => {
        mockedGet.mockResolvedValue({ data: SAMPLE_HISTORY });
        mockedDelete.mockResolvedValue({ data: null });
        const onClose = jest.fn();

        renderWithRouter(
            <PurchaseHistoryModal
                ingredientId={5}
                ingredientName="Potato"
                onClose={onClose}
            />,
        );

        await userEvent.click(
            await screen.findByRole("button", { name: "Delete purchase" }),
        );

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
