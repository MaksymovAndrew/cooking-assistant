import { useCallback, useState } from "react";

import type { MenuFormValues } from "hooks/useMenuForm";

export interface MenuFormErrors {
    menuTitleError: string | null;
    menuDescriptionError: string | null;
    categoryError: string | null;
    recipesError: string | null;
}

export interface MenuFormErrorMessages {
    emptyTitle: string;
    emptyDescription: string;
    noCategory: string;
    noRecipes: string;
}

export const useMenuFormValidation = (messages: MenuFormErrorMessages) => {
    const { emptyTitle, emptyDescription, noCategory, noRecipes } = messages;

    const [menuTitleError, setMenuTitleError] = useState<string | null>(null);
    const [menuDescriptionError, setMenuDescriptionError] = useState<
        string | null
    >(null);
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const [recipesError, setRecipesError] = useState<string | null>(null);

    const validate = useCallback(
        (values: MenuFormValues): boolean => {
            let valid = true;

            if (!values.menuTitle.trim()) {
                setMenuTitleError(emptyTitle);
                valid = false;
            } else {
                setMenuTitleError(null);
            }

            if (!values.menuDescription.trim()) {
                setMenuDescriptionError(emptyDescription);
                valid = false;
            } else {
                setMenuDescriptionError(null);
            }

            if (values.selectedCategory === null) {
                setCategoryError(noCategory);
                valid = false;
            } else {
                setCategoryError(null);
            }

            if (values.selectedRecipes.length === 0) {
                setRecipesError(noRecipes);
                valid = false;
            } else {
                setRecipesError(null);
            }

            return valid;
        },
        [emptyTitle, emptyDescription, noCategory, noRecipes],
    );

    const errors: MenuFormErrors = {
        menuTitleError,
        menuDescriptionError,
        categoryError,
        recipesError,
    };

    return { errors, validate };
};
