import { screen } from "@testing-library/react";

import type { Purchase } from "types/userIngredient";

import { PurchaseHistoryModal } from "components/modals/PurchaseHistoryModal";

import { mockedGet } from "test/apiClientMock";
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
});
