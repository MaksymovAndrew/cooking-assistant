import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { PantryIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { DeleteIngredientModal } from "components/modals/DeleteIngredientModal";

import { mockedDelete } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const INGREDIENT: PantryIngredient = {
    id: 9,
    slug: "salt",
    ingredient_name: "Salt",
    category: "spices",
    unit_name: "g",
    quantity_person_ingradient: 100,
    allergens: [],
    lots: [],
};
const MODAL_ID = "m1";
const MODAL: ActiveModal = {
    id: MODAL_ID,
    type: MODAL_TYPE.deleteIngredient,
    ingredient: INGREDIENT,
};

const renderOpen = () => {
    const store = makeTestStore({ ui: { queue: [MODAL] } });
    const view = renderWithProviders(
        <DeleteIngredientModal modalId={MODAL_ID} ingredient={INGREDIENT} />,
        { store },
    );

    return view;
};

const clickConfirm = () =>
    userEvent.click(screen.getByRole("button", { name: "Confirm" }));

describe("DeleteIngredientModal", () => {
    it("should render the delete confirmation with the ingredient name", () => {
        renderOpen();

        expect(screen.getByText("Delete confirmation")).toBeInTheDocument();
        expect(
            screen.getByText(
                'Are you sure you want to delete the ingredient "Salt"?',
            ),
        ).toBeInTheDocument();
    });

    it("should use the normalized secondary Cancel button (same as other delete dialogs)", () => {
        renderOpen();

        expect(screen.getByRole("button", { name: "Cancel" })).toHaveClass(
            "button--secondary",
        );
    });

    it("should delete the ingredient, notify and close on confirm", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { store } = renderOpen();

        await clickConfirm();

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.item(INGREDIENT.id),
            { params: undefined },
        );
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "success",
                message: "Ingredient deleted",
            }),
        ]);
        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should close the modal without deleting on cancel", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(mockedDelete).not.toHaveBeenCalled();
        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should keep the modal open when deletion fails", async () => {
        mockedDelete.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: "Boom" } },
            message: "Request failed",
        });
        const { store } = renderOpen();

        await clickConfirm();

        expect(selectActiveModal(store.getState())).toEqual(MODAL);
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({ type: "error", message: "Boom" }),
        ]);
    });
});
