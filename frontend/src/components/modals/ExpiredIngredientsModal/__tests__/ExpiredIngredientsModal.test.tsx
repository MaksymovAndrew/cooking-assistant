import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ExpiringIngredient } from "types/expiry";

import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ExpiredIngredientsModal } from "components/modals/ExpiredIngredientsModal";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

const MODAL_ID = "m1";
const INGREDIENTS: ExpiringIngredient[] = [
    {
        ingredientId: 1,
        slug: "milk",
        name: "Milk",
        status: { tone: "expired", days: -2 },
    },
    {
        ingredientId: 2,
        slug: "eggs",
        name: "Eggs",
        status: { tone: "expired", days: -1 },
    },
];
const MODAL: ActiveModal = {
    id: MODAL_ID,
    type: MODAL_TYPE.expiredIngredients,
    ingredients: INGREDIENTS,
};

const renderOpen = () => {
    const store = makeTestStore({ ui: { modal: MODAL } });
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

    it("should close the modal on the close button", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(store.getState().ui.modal).toBeNull();
    });

    it("should link to the pantry and close the modal", async () => {
        const { store } = renderOpen();

        const link = screen.getByRole("link", { name: "Go to my pantry" });

        expect(link).toHaveAttribute("href", "/ingredients");

        await userEvent.click(link);

        expect(store.getState().ui.modal).toBeNull();
    });
});
