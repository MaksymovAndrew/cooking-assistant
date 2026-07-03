import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice, nanoid } from "@reduxjs/toolkit";

import type { PantryIngredient } from "types/userIngredient";

import type { ThemeMode } from "redux/slices/themeSlice";

// global modal manager: the active modal is a discriminated union keyed by
// `type`, so ModalRoot renders the matching modal and reads a typed payload.
// Modal types live here as a single source of truth, with no magic strings.
export const MODAL_TYPE = {
    ingredientHistory: "ingredientHistory",
    deleteRecipe: "deleteRecipe",
    deleteMenu: "deleteMenu",
    deleteIngredient: "deleteIngredient",
    logout: "logout",
    themeChange: "themeChange",
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
}

export interface DeleteRecipeModal extends DeleteRecipeModalInput {
    id: string;
}

export interface DeleteMenuModalInput {
    type: typeof MODAL_TYPE.deleteMenu;
    menuId: string | number;
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
    nextMode: ThemeMode;
}

export interface ThemeChangeModal extends ThemeChangeModalInput {
    id: string;
}

export type ModalInput =
    | IngredientHistoryModalInput
    | DeleteRecipeModalInput
    | DeleteMenuModalInput
    | DeleteIngredientModalInput
    | LogoutModalInput
    | ThemeChangeModalInput;
export type ActiveModal =
    | IngredientHistoryModal
    | DeleteRecipeModal
    | DeleteMenuModal
    | DeleteIngredientModal
    | LogoutModal
    | ThemeChangeModal;

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
