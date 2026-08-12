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
    logIntake: "logIntake",
    news: "news",
    offline: "offline",
} as const;

export interface IngredientHistoryModalInput {
    type: typeof MODAL_TYPE.ingredientHistory;
    ingredientId: number;
    ingredientName: string;
}

export interface DeleteRecipeModalInput {
    type: typeof MODAL_TYPE.deleteRecipe;
    recipeId: string;
    recipeTitle: string;
}

export interface DeleteMenuModalInput {
    type: typeof MODAL_TYPE.deleteMenu;
    menuId: string | number;
    menuTitle: string;
}

export interface DeleteIngredientModalInput {
    type: typeof MODAL_TYPE.deleteIngredient;
    ingredient: PantryIngredient;
}

export interface LogoutModalInput {
    type: typeof MODAL_TYPE.logout;
}

export interface ThemeChangeModalInput {
    type: typeof MODAL_TYPE.themeChange;
    nextMode: ThemeChoice;
}

export interface ExpiredIngredientsModalInput {
    type: typeof MODAL_TYPE.expiredIngredients;
    ingredients: ExpiringIngredient[];
}

export interface DeleteCalorieIntakeModalInput {
    type: typeof MODAL_TYPE.deleteCalorieIntake;
    intakeId: number;
    title: string;
}

export interface CalorieLimitModalInput {
    type: typeof MODAL_TYPE.calorieLimit;
    consumed: number;
    goal: number;
}

export interface LogIntakeModalInput {
    type: typeof MODAL_TYPE.logIntake;
    recipeId?: number;
    menuId?: number;
    title: string;
    caloriesPerPortion: number;
    initialPortions?: number;
}

export interface NewsModalInput {
    type: typeof MODAL_TYPE.news;
}

export interface OfflineModalInput {
    type: typeof MODAL_TYPE.offline;
}

// what a caller provides; the id is generated in the action `prepare` step
export type ModalInput =
    | IngredientHistoryModalInput
    | DeleteRecipeModalInput
    | DeleteMenuModalInput
    | DeleteIngredientModalInput
    | LogoutModalInput
    | ThemeChangeModalInput
    | ExpiredIngredientsModalInput
    | DeleteCalorieIntakeModalInput
    | CalorieLimitModalInput
    | LogIntakeModalInput
    | NewsModalInput
    | OfflineModalInput;

// distributes over the union so `modal.type` still narrows to the matching payload
type WithId<T> = T extends unknown ? T & { id: string } : never;

export type ActiveModal = WithId<ModalInput>;

interface UiState {
    // FIFO: openModal enqueues, closeModal dequeues - only queue[0] is ever rendered, so a second
    // modal opened while one is showing waits its turn instead of clobbering the first
    queue: ActiveModal[];
}

const initialState: UiState = { queue: [] };

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openModal: {
            // a modal covers the screen, so a second one of the same type is always an accidental
            // double dispatch (double-clicked delete button), never a real second request
            reducer: (state, action: PayloadAction<ActiveModal>) => {
                const isQueued = state.queue.some(
                    (modal) => modal.type === action.payload.type,
                );

                if (!isQueued) {
                    state.queue.push(action.payload);
                }
            },
            prepare: (modal: ModalInput) => ({
                payload: { id: nanoid(), ...modal },
            }),
        },
        closeModal: (state, action: PayloadAction<string>) => {
            state.queue = state.queue.filter(
                (modal) => modal.id !== action.payload,
            );
        },
    },
});

export const { openModal, closeModal } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
