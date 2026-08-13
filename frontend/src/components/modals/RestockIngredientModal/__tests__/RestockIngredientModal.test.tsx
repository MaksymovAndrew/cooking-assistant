import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { PantryIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { RestockIngredientModal } from "components/modals/RestockIngredientModal";

import { mockedPut } from "test/apiClientMock";
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
    type: MODAL_TYPE.restockIngredient,
    ingredient: INGREDIENT,
};

const renderOpen = () => {
    const store = makeTestStore({ ui: { queue: [MODAL] } });
    const view = renderWithProviders(
        <RestockIngredientModal modalId={MODAL_ID} ingredient={INGREDIENT} />,
        { store },
    );

    return view;
};

describe("RestockIngredientModal", () => {
    it("should show the ingredient name and its current quantity", () => {
        renderOpen();

        expect(screen.getByText("Buy more Salt")).toBeInTheDocument();
        expect(
            screen.getByText("You currently have 100 gram."),
        ).toBeInTheDocument();
    });

    it("should default the quantity input to 1", () => {
        renderOpen();

        expect(screen.getByRole("spinbutton")).toHaveValue(1);
    });

    it("should add the entered quantity on top of the existing stock and close on confirm", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const { store } = renderOpen();

        const quantityInput = screen.getByRole("spinbutton");

        await userEvent.clear(quantityInput);
        await userEvent.type(quantityInput, "5");
        await userEvent.click(
            screen.getByRole("button", { name: "Add to pantry" }),
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.list,
            {
                ingredients: [
                    {
                        id: INGREDIENT.id,
                        ingredient_name: "Salt",
                        quantity_person_ingradient: 5,
                    },
                ],
            },
        );
        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should close the modal without saving on Cancel", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(mockedPut).not.toHaveBeenCalled();
        expect(selectActiveModal(store.getState())).toBeNull();
    });
});
