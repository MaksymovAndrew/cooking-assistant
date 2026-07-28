import { act } from "@testing-library/react";

import type { UserIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { userIngredientsApi } from "redux/services/userIngredientsApi";
import { closeModal, MODAL_TYPE } from "redux/slices/uiSlice";

import { useExpiredIngredientsNotice } from "hooks/useExpiredIngredientsNotice";

import { mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

// local YYYY-MM-DD string for "n days from now" - avoids UTC round-trip drift
const daysFromNow = (days: number): string => {
    const date = new Date();

    date.setDate(date.getDate() + days);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const EXPIRED_INGREDIENT: UserIngredient = {
    ingredient_id: 1,
    ingredient_slug: "milk",
    ingredient_name: "Milk",
    category: "dairy",
    unit_name: "l",
    quantity_person_ingradient: 1,
    days_to_expire: 5,
    allergens: ["milk"],
    purchase_date: daysFromNow(-10),
};
const FRESH_INGREDIENT: UserIngredient = {
    ingredient_id: 2,
    ingredient_slug: "flour",
    ingredient_name: "Flour",
    category: "flour_baking",
    unit_name: "kg",
    quantity_person_ingradient: 1,
    days_to_expire: 60,
    allergens: ["gluten"],
    purchase_date: daysFromNow(0),
};

const setup = async (
    pantry: UserIngredient[],
    sessionStatus: "authed" | "checking" = "authed",
) => {
    mockGetByUrl({ [API_ROUTES.userIngredients.list]: pantry });

    const store = makeTestStore({ session: { status: sessionStatus } });

    if (sessionStatus === "authed") {
        await store.dispatch(
            userIngredientsApi.endpoints.getUserIngredients.initiate(null),
        );
    }

    return renderHookWithStore(() => {
        useExpiredIngredientsNotice();
    }, store);
};

describe("useExpiredIngredientsNotice", () => {
    it("should open the expired-ingredients modal when the pantry has an expired ingredient", async () => {
        const { store } = await setup([EXPIRED_INGREDIENT, FRESH_INGREDIENT]);

        expect(store.getState().ui.modal).toMatchObject({
            type: MODAL_TYPE.expiredIngredients,
            ingredients: [{ ingredientId: 1, name: "Milk" }],
        });
    });

    it("should not open a modal when nothing in the pantry is expired", async () => {
        const { store } = await setup([FRESH_INGREDIENT]);

        expect(store.getState().ui.modal).toBeNull();
    });

    it("should not open a modal while the session is still checking", async () => {
        const { store } = await setup([EXPIRED_INGREDIENT], "checking");

        expect(store.getState().ui.modal).toBeNull();
    });

    it("should not reopen the modal on a later mount once already shown this session", async () => {
        const { store } = await setup([EXPIRED_INGREDIENT]);
        const openedModal = store.getState().ui.modal;

        expect(openedModal).not.toBeNull();

        act(() => {
            store.dispatch(closeModal(openedModal?.id ?? ""));
        });

        renderHookWithStore(() => {
            useExpiredIngredientsNotice();
        }, store);

        expect(store.getState().ui.modal).toBeNull();
    });
});
