import { act } from "@testing-library/react";

import type { ExpiringIngredient } from "types/expiry";
import type { PantryIngredient } from "types/userIngredient";

import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ModalRoot } from "components/modals";
import { CalorieLimitModal } from "components/modals/CalorieLimitModal";
import { DeleteCalorieIntakeModal } from "components/modals/DeleteCalorieIntakeModal";
import { DeleteIngredientModal } from "components/modals/DeleteIngredientModal";
import { DeleteMenuModal } from "components/modals/DeleteMenuModal";
import { DeleteRecipeModal } from "components/modals/DeleteRecipeModal";
import { ExpiredIngredientsModal } from "components/modals/ExpiredIngredientsModal";
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
jest.mock("components/modals/ExpiredIngredientsModal", () => ({
    ExpiredIngredientsModal: jest.fn(() => null),
}));
jest.mock("components/modals/DeleteCalorieIntakeModal", () => ({
    DeleteCalorieIntakeModal: jest.fn(() => null),
}));
jest.mock("components/modals/CalorieLimitModal", () => ({
    CalorieLimitModal: jest.fn(() => null),
}));

const mockedModal = jest.mocked(PurchaseHistoryModal);
const mockedDeleteRecipe = jest.mocked(DeleteRecipeModal);
const mockedDeleteMenu = jest.mocked(DeleteMenuModal);
const mockedDeleteIngredient = jest.mocked(DeleteIngredientModal);
const mockedLogout = jest.mocked(LogoutConfirmModal);
const mockedThemeChange = jest.mocked(ThemeChangeConfirmModal);
const mockedExpiredIngredients = jest.mocked(ExpiredIngredientsModal);
const mockedDeleteCalorieIntake = jest.mocked(DeleteCalorieIntakeModal);
const mockedCalorieLimit = jest.mocked(CalorieLimitModal);

const INGREDIENT: PantryIngredient = {
    id: 9,
    slug: "salt",
    ingredient_name: "Salt",
    category: "spices",
    unit_name: "g",
    quantity_person_ingradient: 100,
    allergens: [],
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

    it("should render the delete-recipe modal with its id, recipe id and title", () => {
        renderWithProviders(<ModalRoot />, {
            store: makeTestStore({
                ui: {
                    modal: {
                        id: "modal-2",
                        type: MODAL_TYPE.deleteRecipe,
                        recipeId: "42",
                        recipeTitle: "Slow-roasted ragù",
                    },
                },
            }),
        });

        const props = mockedDeleteRecipe.mock.calls[0][0];

        expect(props.modalId).toBe("modal-2");
        expect(props.recipeId).toBe("42");
        expect(props.recipeTitle).toBe("Slow-roasted ragù");
    });

    it("should render the delete-menu modal with its id and menu id", () => {
        renderWithProviders(<ModalRoot />, {
            store: makeTestStore({
                ui: {
                    modal: {
                        id: "modal-3",
                        type: MODAL_TYPE.deleteMenu,
                        menuId: 7,
                        menuTitle: "Week of Comfort",
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

    it("should render the expired-ingredients modal with its id and ingredient list", () => {
        const ingredients: ExpiringIngredient[] = [
            {
                ingredientId: 1,
                slug: "milk",
                name: "Milk",
                status: { tone: "expired", days: -2 },
            },
        ];

        renderWithProviders(<ModalRoot />, {
            store: makeTestStore({
                ui: {
                    modal: {
                        id: "modal-7",
                        type: MODAL_TYPE.expiredIngredients,
                        ingredients,
                    },
                },
            }),
        });

        const props = mockedExpiredIngredients.mock.calls[0][0];

        expect(props.modalId).toBe("modal-7");
        expect(props.ingredients).toEqual(ingredients);
    });

    it("should render the delete-calorie-intake modal with its id, intake id and title", () => {
        renderWithProviders(<ModalRoot />, {
            store: makeTestStore({
                ui: {
                    modal: {
                        id: "modal-8",
                        type: MODAL_TYPE.deleteCalorieIntake,
                        intakeId: 9,
                        title: "Miso ramen",
                    },
                },
            }),
        });

        const props = mockedDeleteCalorieIntake.mock.calls[0][0];

        expect(props.modalId).toBe("modal-8");
        expect(props.intakeId).toBe(9);
        expect(props.title).toBe("Miso ramen");
    });

    it("should render the calorie-limit modal with its id, consumed and goal", () => {
        renderWithProviders(<ModalRoot />, {
            store: makeTestStore({
                ui: {
                    modal: {
                        id: "modal-9",
                        type: MODAL_TYPE.calorieLimit,
                        consumed: 2520,
                        goal: 2200,
                    },
                },
            }),
        });

        const props = mockedCalorieLimit.mock.calls[0][0];

        expect(props.modalId).toBe("modal-9");
        expect(props.consumed).toBe(2520);
        expect(props.goal).toBe(2200);
    });
});
