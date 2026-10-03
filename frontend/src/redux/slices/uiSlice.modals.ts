import type { ThemeChoice } from "redux/slices/themeSlice";

import type { AccountModalInput } from "./uiSlice.modals.account";
import type { CookedItModalInput } from "./uiSlice.modals.cooking";
import type { PantryModalInput } from "./uiSlice.modals.pantry";

export const MODAL_TYPE = {
    ingredientHistory: "ingredientHistory",
    deleteRecipe: "deleteRecipe",
    deleteMenu: "deleteMenu",
    deleteIngredient: "deleteIngredient",
    logout: "logout",
    signOutEverywhere: "signOutEverywhere",
    themeChange: "themeChange",
    expiredIngredients: "expiredIngredients",
    deleteCalorieIntake: "deleteCalorieIntake",
    calorieLimit: "calorieLimit",
    logIntake: "logIntake",
    news: "news",
    offline: "offline",
    restockIngredient: "restockIngredient",
    deleteTag: "deleteTag",
    cookedIt: "cookedIt",
    addIngredient: "addIngredient",
    editProfile: "editProfile",
    changePassword: "changePassword",
    deleteAccount: "deleteAccount",
} as const;

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

export interface LogoutModalInput {
    type: typeof MODAL_TYPE.logout;
}

export interface SignOutEverywhereModalInput {
    type: typeof MODAL_TYPE.signOutEverywhere;
}

export interface ThemeChangeModalInput {
    type: typeof MODAL_TYPE.themeChange;
    nextMode: ThemeChoice;
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

export interface DeleteTagModalInput {
    type: typeof MODAL_TYPE.deleteTag;
    tagId: number;
    tagName: string;
}

export type ModalInput =
    | DeleteRecipeModalInput
    | DeleteMenuModalInput
    | LogoutModalInput
    | SignOutEverywhereModalInput
    | ThemeChangeModalInput
    | DeleteCalorieIntakeModalInput
    | CalorieLimitModalInput
    | LogIntakeModalInput
    | NewsModalInput
    | OfflineModalInput
    | DeleteTagModalInput
    | CookedItModalInput
    | PantryModalInput
    | AccountModalInput;

// distributes over the union so `modal.type` still narrows to the matching payload
type WithId<T> = T extends unknown ? T & { id: string } : never;

export type ActiveModal = WithId<ModalInput>;
