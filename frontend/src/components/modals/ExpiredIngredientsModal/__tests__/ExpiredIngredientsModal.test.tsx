import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ExpiredPantryIngredient } from "types/expiry";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ExpiredIngredientsModal } from "components/modals/ExpiredIngredientsModal";

import { mockedPost } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const MODAL_ID = "m1";
const INGREDIENTS: ExpiredPantryIngredient[] = [
    {
        ingredientId: 1,
        slug: "milk",
        name: "Milk",
        unitName: "L",
        lots: [
            {
                purchaseId: 103,
                quantity: 1,
                purchaseDate: "2026-01-01T00:00:00.000Z",
                expiryDate: "2026-01-05T00:00:00.000Z",
            },
        ],
    },
    {
        ingredientId: 2,
        slug: "eggs",
        name: "Eggs",
        unitName: "piece",
        lots: [
            {
                purchaseId: 102,
                quantity: 6,
                purchaseDate: "2026-01-02T00:00:00.000Z",
                expiryDate: "2026-01-09T00:00:00.000Z",
            },
            {
                purchaseId: 101,
                quantity: 12,
                purchaseDate: "2026-01-03T00:00:00.000Z",
                expiryDate: "2026-01-10T00:00:00.000Z",
            },
        ],
    },
];
const MODAL: ActiveModal = {
    id: MODAL_ID,
    type: MODAL_TYPE.expiredIngredients,
    ingredients: INGREDIENTS,
};

const renderOpen = () => {
    const store = makeTestStore({ ui: { queue: [MODAL] } });
    const view = renderWithProviders(
        <ExpiredIngredientsModal
            modalId={MODAL_ID}
            ingredients={INGREDIENTS}
        />,
        { store },
    );

    return view;
};

describe("ExpiredIngredientsModal", () => {
    it("should list every expired ingredient by name", () => {
        renderOpen();

        expect(screen.getByText("Expired ingredients")).toBeInTheDocument();
        expect(screen.getByText("Milk")).toBeInTheDocument();
        expect(screen.getByText("Eggs")).toBeInTheDocument();
    });

    it("should list every expired lot's quantity, not just one per ingredient", () => {
        renderOpen();

        expect(screen.getByText("1 L")).toBeInTheDocument();
        expect(screen.getByText("6 pieces")).toBeInTheDocument();
        expect(screen.getByText("12 pieces")).toBeInTheDocument();
    });

    it("should count purchases, not ingredients, in the summary message", () => {
        renderOpen();

        // 1 milk lot + 2 egg lots = 3 purchases across 2 ingredients
        expect(
            screen.getByText("3 purchases in your pantry have expired:"),
        ).toBeInTheDocument();
    });

    it("should close the modal on the close button", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should link to the pantry and close the modal", async () => {
        const { store } = renderOpen();

        const link = screen.getByRole("link", { name: "Go to my pantry" });

        expect(link).toHaveAttribute("href", "/ingredients");

        await userEvent.click(link);

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should throw out every expired purchase and close", async () => {
        mockedPost.mockResolvedValue({ data: { discarded: 3 } });
        const { store } = renderOpen();

        await userEvent.click(
            screen.getByRole("button", { name: "Throw out expired" }),
        );

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.discard,
            { purchaseIds: [103, 102, 101] },
        );
        expect(selectActiveModal(store.getState())).toBeNull();
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "success",
                message: "Expired purchases thrown out",
            }),
        ]);
    });

    it("should put every expired ingredient on the shopping list by name", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const { store } = renderOpen();

        await userEvent.click(
            screen.getByRole("button", { name: "Add to shopping list" }),
        );

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.ingredients,
            {
                items: [
                    { ingredient_id: 1, quantity: null },
                    { ingredient_id: 2, quantity: null },
                ],
            },
        );
        expect(selectActiveModal(store.getState())).not.toBeNull();
    });
});
