import type { ExpiredPantryIngredient } from "types/expiry";
import type { PantryIngredient } from "types/userIngredient";

import type { ActiveModal, ModalInput } from "redux/slices/uiSlice";
import {
    closeModal,
    MODAL_TYPE,
    openModal,
    uiReducer,
} from "redux/slices/uiSlice";

const MODAL_INPUT: ModalInput = {
    type: MODAL_TYPE.ingredientHistory,
    ingredientId: 1,
    ingredientName: "Salt",
};
const MODAL: ActiveModal = { id: "modal-1", ...MODAL_INPUT };

const PANTRY_INGREDIENT: PantryIngredient = {
    id: 9,
    slug: "salt",
    ingredient_name: "Salt",
    category: "spices",
    unit_name: "g",
    quantity_person_ingradient: 100,
    allergens: [],
    lots: [],
};

describe("uiSlice", () => {
    it("should start with an empty queue", () => {
        expect(uiReducer(undefined, { type: "@@INIT" }).queue).toEqual([]);
    });

    it("should open a modal with a generated id", () => {
        const state = uiReducer(undefined, openModal(MODAL_INPUT));

        expect(state.queue).toHaveLength(1);
        expect(state.queue[0]).toMatchObject(MODAL_INPUT);
        expect(state.queue[0].id.length).toBeGreaterThan(0);
    });

    it("should close the matching modal by id", () => {
        expect(
            uiReducer({ queue: [MODAL] }, closeModal("modal-1")).queue,
        ).toEqual([]);
    });

    it("should keep the active modal when the close id does not match", () => {
        expect(
            uiReducer({ queue: [MODAL] }, closeModal("modal-2")).queue,
        ).toEqual([MODAL]);
    });

    it("should queue a second modal behind the first instead of replacing it", () => {
        const afterFirst = uiReducer(undefined, openModal(MODAL_INPUT));
        const state = uiReducer(
            afterFirst,
            openModal({ type: MODAL_TYPE.logout }),
        );

        expect(state.queue).toHaveLength(2);
        expect(state.queue[0]).toMatchObject(MODAL_INPUT);
        expect(state.queue[1]).toMatchObject({ type: MODAL_TYPE.logout });
    });

    it("should promote the next queued modal when the active one closes", () => {
        const afterFirst = uiReducer(undefined, openModal(MODAL_INPUT));
        const afterSecond = uiReducer(
            afterFirst,
            openModal({ type: MODAL_TYPE.logout }),
        );

        const state = uiReducer(
            afterSecond,
            closeModal(afterSecond.queue[0].id),
        );

        expect(state.queue).toHaveLength(1);
        expect(state.queue[0]).toMatchObject({ type: MODAL_TYPE.logout });
    });

    it("should ignore a modal whose type is already queued", () => {
        const afterFirst = uiReducer(undefined, openModal(MODAL_INPUT));
        const state = uiReducer(afterFirst, openModal(MODAL_INPUT));

        expect(state.queue).toHaveLength(1);
        expect(state.queue[0].id).toBe(afterFirst.queue[0].id);
    });

    it("should open a delete-recipe modal carrying the recipe id and title", () => {
        const state = uiReducer(
            undefined,
            openModal({
                type: MODAL_TYPE.deleteRecipe,
                recipeId: "42",
                recipeTitle: "Slow-roasted ragù",
            }),
        );

        expect(state.queue[0]).toMatchObject({
            type: "deleteRecipe",
            recipeId: "42",
            recipeTitle: "Slow-roasted ragù",
        });
        expect(state.queue[0].id.length).toBeGreaterThan(0);
    });

    it("should open a delete-menu modal carrying the menu id", () => {
        const state = uiReducer(
            undefined,
            openModal({
                type: MODAL_TYPE.deleteMenu,
                menuId: 7,
                menuTitle: "Week of Comfort",
            }),
        );

        expect(state.queue[0]).toMatchObject({
            type: "deleteMenu",
            menuId: 7,
            menuTitle: "Week of Comfort",
        });
        expect(state.queue[0].id.length).toBeGreaterThan(0);
    });

    it("should open a delete-ingredient modal carrying the ingredient", () => {
        const state = uiReducer(
            undefined,
            openModal({
                type: MODAL_TYPE.deleteIngredient,
                ingredient: PANTRY_INGREDIENT,
            }),
        );

        expect(state.queue[0]).toMatchObject({
            type: "deleteIngredient",
            ingredient: PANTRY_INGREDIENT,
        });
        expect(state.queue[0].id.length).toBeGreaterThan(0);
    });

    it("should open an expired-ingredients modal carrying the ingredient list", () => {
        const ingredients: ExpiredPantryIngredient[] = [
            {
                ingredientId: 1,
                slug: "milk",
                name: "Milk",
                unitName: "l",
                lots: [
                    {
                        quantity: 1,
                        purchaseDate: "2026-01-01T00:00:00.000Z",
                        expiryDate: "2026-01-05T00:00:00.000Z",
                    },
                ],
            },
        ];

        const state = uiReducer(
            undefined,
            openModal({ type: MODAL_TYPE.expiredIngredients, ingredients }),
        );

        expect(state.queue[0]).toMatchObject({
            type: "expiredIngredients",
            ingredients,
        });
        expect(state.queue[0].id.length).toBeGreaterThan(0);
    });
});
