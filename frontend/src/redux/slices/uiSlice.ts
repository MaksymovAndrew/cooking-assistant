import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice, nanoid } from "@reduxjs/toolkit";

import type { ExpiringIngredient } from "types/expiry";
import type { PantryIngredient } from "types/userIngredient";

import type { ThemeChoice } from "redux/slices/themeSlice";

// discriminated union keyed by `type` so ModalRoot renders the matching modal with a typed payload
export const MODAL_TYPE = {
    ingredientHistory: "ingredientHistory",
    deleteRecipe: "deleteRecipe",
    deleteMenu: "deleteMenu",
    deleteIngredient: "deleteIngredient",
    logout: "logout",
    themeChange: "themeChange",
    expiredIngredients: "expiredIngredients",
    deleteCalorieIntake: "deleteCalorieIntake",
    calorieLimit: "calorieLimit",
} as const;

export interface IngredientHistoryModalInput {
    type: typeof MODAL_TYPE.ingredientHistory;
    ingredientId: number;
    ingredientName: string;
}

export interface IngredientHistoryModal extends IngredientHistoryModalInput {
    id: string;
}

export interface DeleteRecipeModalInput {
    type: typeof MODAL_TYPE.deleteRecipe;
    recipeId: string;
    recipeTitle: string;
}

export interface DeleteRecipeModal extends DeleteRecipeModalInput {
    id: string;
}

export interface DeleteMenuModalInput {
    type: typeof MODAL_TYPE.deleteMenu;
    menuId: string | number;
    menuTitle: string;
}

export interface DeleteMenuModal extends DeleteMenuModalInput {
    id: string;
}

export interface DeleteIngredientModalInput {
    type: typeof MODAL_TYPE.deleteIngredient;
    ingredient: PantryIngredient;
}

export interface DeleteIngredientModal extends DeleteIngredientModalInput {
    id: string;
}

export interface LogoutModalInput {
    type: typeof MODAL_TYPE.logout;
}

export interface LogoutModal extends LogoutModalInput {
    id: string;
}

export interface ThemeChangeModalInput {
    type: typeof MODAL_TYPE.themeChange;
    nextMode: ThemeChoice;
}

export interface ThemeChangeModal extends ThemeChangeModalInput {
    id: string;
}

export interface ExpiredIngredientsModalInput {
    type: typeof MODAL_TYPE.expiredIngredients;
    ingredients: ExpiringIngredient[];
}

export interface ExpiredIngredientsModal extends ExpiredIngredientsModalInput {
    id: string;
}

export interface DeleteCalorieIntakeModalInput {
    type: typeof MODAL_TYPE.deleteCalorieIntake;
    intakeId: number;
    title: string;
}

export interface DeleteCalorieIntakeModal extends DeleteCalorieIntakeModalInput {
    id: string;
}

export interface CalorieLimitModalInput {
    type: typeof MODAL_TYPE.calorieLimit;
    consumed: number;
    goal: number;
}

export interface CalorieLimitModal extends CalorieLimitModalInput {
    id: string;
}

export type ModalInput =
    | IngredientHistoryModalInput
    | DeleteRecipeModalInput
    | DeleteMenuModalInput
    | DeleteIngredientModalInput
    | LogoutModalInput
    | ThemeChangeModalInput
    | ExpiredIngredientsModalInput
    | DeleteCalorieIntakeModalInput
    | CalorieLimitModalInput;
export type ActiveModal =
    | IngredientHistoryModal
    | DeleteRecipeModal
    | DeleteMenuModal
    | DeleteIngredientModal
    | LogoutModal
    | ThemeChangeModal
    | ExpiredIngredientsModal
    | DeleteCalorieIntakeModal
    | CalorieLimitModal;

interface UiState {
    modal: ActiveModal | null;
}

const initialState: UiState = { modal: null };

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openModal: {
            reducer: (state, action: PayloadAction<ActiveModal>) => {
                state.modal = action.payload;
            },
            prepare: (modal: ModalInput) => ({
                payload: { id: nanoid(), ...modal },
            }),
        },
        closeModal: (state, action: PayloadAction<string>) => {
            if (state.modal?.id === action.payload) {
                state.modal = null;
            }
        },
    },
});

export const { openModal, closeModal } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
