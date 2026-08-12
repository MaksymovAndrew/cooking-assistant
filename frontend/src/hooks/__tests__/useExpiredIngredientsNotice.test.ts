import { act } from "@testing-library/react";

import type { UserIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import { userIngredientsApi } from "redux/services/userIngredientsApi";
import type { ActiveModal } from "redux/slices/uiSlice";
import { closeModal, MODAL_TYPE } from "redux/slices/uiSlice";

import { useExpiredIngredientsNotice } from "hooks/useExpiredIngredientsNotice";

import { hasShownExpiredIngredientsNotice } from "utils/expiredIngredientsNoticeStorage";

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
    queue: ActiveModal[] = [],
) => {
    mockGetByUrl({ [API_ROUTES.userIngredients.list]: pantry });

    const store = makeTestStore({
        session: { status: sessionStatus },
        ui: { queue },
    });

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

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.expiredIngredients,
            ingredients: [{ ingredientId: 1, name: "Milk" }],
        });
    });

    it("should not open a modal when nothing in the pantry is expired", async () => {
        const { store } = await setup([FRESH_INGREDIENT]);

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should not open a modal while the session is still checking", async () => {
        const { store } = await setup([EXPIRED_INGREDIENT], "checking");

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should wait behind a modal that is already showing instead of replacing it", async () => {
        const { store } = await setup([EXPIRED_INGREDIENT], "authed", [
            { id: "m1", type: MODAL_TYPE.logout },
        ]);

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.logout,
        });

        act(() => {
            store.dispatch(closeModal("m1"));
        });

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.expiredIngredients,
        });
    });

    it("should not mark the notice as shown while it is still waiting in the queue", async () => {
        const { store } = await setup([EXPIRED_INGREDIENT], "authed", [
            { id: "m1", type: MODAL_TYPE.logout },
        ]);

        expect(hasShownExpiredIngredientsNotice()).toBe(false);

        act(() => {
            store.dispatch(closeModal("m1"));
        });

        expect(hasShownExpiredIngredientsNotice()).toBe(true);
    });

    it("should not reopen the modal on a later mount once already shown this session", async () => {
        const { store } = await setup([EXPIRED_INGREDIENT]);
        const openedModal = selectActiveModal(store.getState());

        expect(openedModal).not.toBeNull();

        act(() => {
            store.dispatch(closeModal(openedModal?.id ?? ""));
        });

        renderHookWithStore(() => {
            useExpiredIngredientsNotice();
        }, store);

        expect(selectActiveModal(store.getState())).toBeNull();
    });
});
