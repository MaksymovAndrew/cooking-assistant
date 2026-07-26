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
    ingredient_name: "Salt",
    unit_name: "g",
    quantity_person_ingradient: 100,
    allergens: [],
};

describe("uiSlice", () => {
    it("should start with no modal", () => {
        expect(uiReducer(undefined, { type: "@@INIT" }).modal).toBeNull();
    });

    it("should open a modal with a generated id", () => {
        const state = uiReducer(undefined, openModal(MODAL_INPUT));

        expect(state.modal).toMatchObject(MODAL_INPUT);
        expect(state.modal?.id.length).toBeGreaterThan(0);
    });

    it("should close the matching modal by id", () => {
        expect(
            uiReducer({ modal: MODAL }, closeModal("modal-1")).modal,
        ).toBeNull();
    });

    it("should keep the active modal when the close id does not match", () => {
        expect(
            uiReducer({ modal: MODAL }, closeModal("modal-2")).modal,
        ).toEqual(MODAL);
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

        expect(state.modal).toMatchObject({
            type: "deleteRecipe",
            recipeId: "42",
            recipeTitle: "Slow-roasted ragù",
        });
        expect(state.modal?.id.length).toBeGreaterThan(0);
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

        expect(state.modal).toMatchObject({
            type: "deleteMenu",
            menuId: 7,
            menuTitle: "Week of Comfort",
        });
        expect(state.modal?.id.length).toBeGreaterThan(0);
    });

    it("should open a delete-ingredient modal carrying the ingredient", () => {
        const state = uiReducer(
            undefined,
            openModal({
                type: MODAL_TYPE.deleteIngredient,
                ingredient: PANTRY_INGREDIENT,
            }),
        );

        expect(state.modal).toMatchObject({
            type: "deleteIngredient",
            ingredient: PANTRY_INGREDIENT,
        });
        expect(state.modal?.id.length).toBeGreaterThan(0);
    });
});
