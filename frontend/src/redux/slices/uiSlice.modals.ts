import type { ExpiredPantryIngredient } from "types/expiry";
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
    restockIngredient: "restockIngredient",
    deleteTag: "deleteTag",
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
    ingredients: ExpiredPantryIngredient[];
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

export interface RestockIngredientModalInput {
    type: typeof MODAL_TYPE.restockIngredient;
    ingredient: PantryIngredient;
}

// what a caller provides; the id is generated in the action `prepare` step
export interface DeleteTagModalInput {
    type: typeof MODAL_TYPE.deleteTag;
    tagId: number;
    tagName: string;
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
    | CalorieLimitModalInput
    | LogIntakeModalInput
    | NewsModalInput
    | OfflineModalInput
    | RestockIngredientModalInput
    | DeleteTagModalInput;

// distributes over the union so `modal.type` still narrows to the matching payload
type WithId<T> = T extends unknown ? T & { id: string } : never;

export type ActiveModal = WithId<ModalInput>;
