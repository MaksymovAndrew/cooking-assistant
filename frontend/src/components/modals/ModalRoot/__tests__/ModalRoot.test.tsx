import { act } from "@testing-library/react";

import type { PantryIngredient } from "types/userIngredient";

import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ModalRoot } from "components/modals";
import { DeleteIngredientModal } from "components/modals/DeleteIngredientModal";
import { DeleteMenuModal } from "components/modals/DeleteMenuModal";
import { DeleteRecipeModal } from "components/modals/DeleteRecipeModal";
import { LogoutConfirmModal } from "components/modals/LogoutConfirmModal";
import { PurchaseHistoryModal } from "components/modals/PurchaseHistoryModal";
import { ThemeChangeConfirmModal } from "components/modals/ThemeChangeConfirmModal";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("components/modals/PurchaseHistoryModal", () => ({
    PurchaseHistoryModal: jest.fn(() => null),
}));
jest.mock("components/modals/DeleteRecipeModal", () => ({
    DeleteRecipeModal: jest.fn(() => null),
}));
jest.mock("components/modals/DeleteMenuModal", () => ({
    DeleteMenuModal: jest.fn(() => null),
}));
jest.mock("components/modals/DeleteIngredientModal", () => ({
    DeleteIngredientModal: jest.fn(() => null),
}));
jest.mock("components/modals/LogoutConfirmModal", () => ({
    LogoutConfirmModal: jest.fn(() => null),
}));
jest.mock("components/modals/ThemeChangeConfirmModal", () => ({
    ThemeChangeConfirmModal: jest.fn(() => null),
}));

const mockedModal = jest.mocked(PurchaseHistoryModal);
const mockedDeleteRecipe = jest.mocked(DeleteRecipeModal);
const mockedDeleteMenu = jest.mocked(DeleteMenuModal);
const mockedDeleteIngredient = jest.mocked(DeleteIngredientModal);
const mockedLogout = jest.mocked(LogoutConfirmModal);
const mockedThemeChange = jest.mocked(ThemeChangeConfirmModal);

const INGREDIENT: PantryIngredient = {
    id: 9,
    ingredient_name: "Salt",
    unit_name: "g",
    quantity_person_ingradient: 100,
};

const MODAL: ActiveModal = {
    id: "modal-1",
    type: MODAL_TYPE.ingredientHistory,
    ingredientId: 7,
    ingredientName: "Salt",
};

describe("ModalRoot", () => {
    it("should render the history modal for the ingredientHistory type", () => {
        renderWithProviders(<ModalRoot />, {
            store: makeTestStore({ ui: { modal: MODAL } }),
        });

        expect(mockedModal).toHaveBeenCalled();

        const props = mockedModal.mock.calls[0][0];

        expect(props.ingredientId).toBe(7);
        expect(props.ingredientName).toBe("Salt");
    });

    it("should close the modal when the child requests it", () => {
        const store = makeTestStore({ ui: { modal: MODAL } });

        renderWithProviders(<ModalRoot />, { store });

        const props = mockedModal.mock.calls[0][0];

        act(() => {
            props.onClose();
        });

        expect(store.getState().ui.modal).toBeNull();
    });

    it("should render nothing when no modal is open", () => {
        const { container } = renderWithProviders(<ModalRoot />, {
            store: makeTestStore(),
        });

        expect(container).toBeEmptyDOMElement();
        expect(mockedModal).not.toHaveBeenCalled();
    });

    it("should render the delete-recipe modal with its id and recipe id", () => {
        renderWithProviders(<ModalRoot />, {
            store: makeTestStore({
                ui: {
                    modal: {
                        id: "modal-2",
                        type: MODAL_TYPE.deleteRecipe,
                        recipeId: "42",
                    },
                },
            }),
        });

        const props = mockedDeleteRecipe.mock.calls[0][0];

        expect(props.modalId).toBe("modal-2");
        expect(props.recipeId).toBe("42");
    });

    it("should render the delete-menu modal with its id and menu id", () => {
        renderWithProviders(<ModalRoot />, {
            store: makeTestStore({
                ui: {
                    modal: {
                        id: "modal-3",
                        type: MODAL_TYPE.deleteMenu,
                        menuId: 7,
                    },
                },
            }),
        });

        const props = mockedDeleteMenu.mock.calls[0][0];

        expect(props.modalId).toBe("modal-3");
        expect(props.menuId).toBe(7);
    });

    it("should render the delete-ingredient modal with its id and ingredient", () => {
        renderWithProviders(<ModalRoot />, {
            store: makeTestStore({
                ui: {
                    modal: {
                        id: "modal-4",
                        type: MODAL_TYPE.deleteIngredient,
                        ingredient: INGREDIENT,
                    },
                },
            }),
        });

        const props = mockedDeleteIngredient.mock.calls[0][0];

        expect(props.modalId).toBe("modal-4");
        expect(props.ingredient).toEqual(INGREDIENT);
    });

    it("should render the logout modal with its id", () => {
        renderWithProviders(<ModalRoot />, {
            store: makeTestStore({
                ui: { modal: { id: "modal-5", type: MODAL_TYPE.logout } },
            }),
        });

        const props = mockedLogout.mock.calls[0][0];

        expect(props.modalId).toBe("modal-5");
    });

    it("should render the theme-change modal with its id and next mode", () => {
        renderWithProviders(<ModalRoot />, {
            store: makeTestStore({
                ui: {
                    modal: {
                        id: "modal-6",
                        type: MODAL_TYPE.themeChange,
                        nextMode: "dark",
                    },
                },
            }),
        });

        const props = mockedThemeChange.mock.calls[0][0];

        expect(props.modalId).toBe("modal-6");
        expect(props.nextMode).toBe("dark");
    });
});
