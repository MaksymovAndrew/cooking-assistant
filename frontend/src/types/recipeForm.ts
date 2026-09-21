import type { CatalogIngredientRef } from "types/catalogIngredientRef";

export interface RecipeFormIngredient extends CatalogIngredientRef {
    id: number;
    name: string;
    quantity: number;
    unit_name: string;
    calories_per_unit: number | null;
}

export interface RecipeFormInitialValues {
    title: string;
    content: string;
    cookingHours: string;
    cookingMinutes: string;
    selectedTypeId: number | null;
    selectedIngredients: RecipeFormIngredient[];
    // text state, empty means "compute automatically"; matches cookingHours/cookingMinutes's convention of staying a string until submit
    caloriesOverride: string;
    photoKey: string | null;
}

export interface RecipeFormCreateMessages {
    errorTitle: string;
    errorDescription: string;
    errorIngredients: string;
    errorType: string;
    errorCookingTimeFormat: string;
    errorCookingTimeInvalid: string;
}

export interface RecipeFormChangeMessages {
    errorCookingTimeFormat: string;
    errorCookingTimeInvalid: string;
}
