import type { Locale } from "constants/locales";
import type { RecipeListItem } from "types/recipe";

export interface MenuFormValues {
    menuTitle: string;
    menuDescription: string;
    language: Locale;
    selectedCategory: number | null;
    selectedRecipes: RecipeListItem[];
    photoKey: string | null;
}

export interface MenuFormErrorMessages {
    emptyTitle: string;
    emptyDescription: string;
    noCategory: string;
    noRecipes: string;
}
