import type { Locale } from "constants/locales";

export interface MenuFormValues {
    menuTitle: string;
    menuDescription: string;
    language: Locale;
    selectedCategory: number | null;
    selectedRecipes: number[];
    photoKey: string | null;
}

export interface MenuFormErrorMessages {
    emptyTitle: string;
    emptyDescription: string;
    noCategory: string;
    noRecipes: string;
}
