export interface MenuFormValues {
    menuTitle: string;
    menuDescription: string;
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
