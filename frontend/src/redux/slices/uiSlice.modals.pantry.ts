import type { ExpiredPantryIngredient } from "types/expiry";
import type { PantryIngredient } from "types/userIngredient";

import type { MODAL_TYPE } from "./uiSlice.modals";

export interface IngredientHistoryModalInput {
    type: typeof MODAL_TYPE.ingredientHistory;
    ingredientId: number;
    ingredientName: string;
}

export interface DeleteIngredientModalInput {
    type: typeof MODAL_TYPE.deleteIngredient;
    ingredient: PantryIngredient;
}

export interface ExpiredIngredientsModalInput {
    type: typeof MODAL_TYPE.expiredIngredients;
    ingredients: ExpiredPantryIngredient[];
}

export interface RestockIngredientModalInput {
    type: typeof MODAL_TYPE.restockIngredient;
    ingredient: PantryIngredient;
}

export interface AddIngredientModalInput {
    type: typeof MODAL_TYPE.addIngredient;
}

export type PantryModalInput =
    | IngredientHistoryModalInput
    | DeleteIngredientModalInput
    | ExpiredIngredientsModalInput
    | RestockIngredientModalInput
    | AddIngredientModalInput;
