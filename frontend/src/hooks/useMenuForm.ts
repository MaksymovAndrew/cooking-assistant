import { useCallback, useState } from "react";

import type { Locale } from "constants/locales";
import type { MenuFormErrorMessages, MenuFormValues } from "types/menuForm";

import { useDirtyRef } from "hooks/useDirtyRef";
import { useLocale } from "hooks/useLocale";
import { useMenuFormValidation } from "hooks/useMenuFormValidation";
import { useRecordPhotoDraft } from "hooks/useRecordPhotoDraft";
import { useSelectedRecipes } from "hooks/useSelectedRecipes";

import { differsFromSnapshot } from "utils/formSnapshot";

export interface UseMenuFormOptions {
    errorMessages: MenuFormErrorMessages;
}

const BLANK_SNAPSHOT: Omit<MenuFormValues, "language"> = {
    menuTitle: "",
    menuDescription: "",
    selectedCategory: null,
    selectedRecipes: [],
    photoKey: null,
};

export const useMenuForm = (options: UseMenuFormOptions) => {
    const locale = useLocale();
    const [menuTitle, setMenuTitle] = useState("");
    const [language, setLanguage] = useState<Locale>(locale);
    const [menuDescription, setMenuDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );
    const recipes = useSelectedRecipes();
    const { selectedRecipes, setSelectedRecipes } = recipes;
    const [initialSnapshot, setInitialSnapshot] = useState<MenuFormValues>({
        ...BLANK_SNAPSHOT,
        language: locale,
    });
    const photo = useRecordPhotoDraft("menu");
    const { reset: resetPhoto } = photo;

    const { errors, attachForm, validate } = useMenuFormValidation(
        options.errorMessages,
    );

    const validateForm = useCallback(
        (): boolean =>
            validate({
                menuTitle,
                menuDescription,
                selectedCategory,
                selectedRecipes,
            }),
        [
            validate,
            menuTitle,
            menuDescription,
            selectedCategory,
            selectedRecipes,
        ],
    );

    const setInitialValues = useCallback(
        (values: MenuFormValues) => {
            setMenuTitle(values.menuTitle);
            setLanguage(values.language);
            setMenuDescription(values.menuDescription);
            setSelectedCategory(values.selectedCategory);
            setSelectedRecipes(values.selectedRecipes);
            resetPhoto(values.photoKey);
            setInitialSnapshot(values);
        },
        [resetPhoto, setSelectedRecipes],
    );

    // the photo keeps its own dirty state: a picked file is not a value that serializes
    const current: MenuFormValues = {
        menuTitle,
        menuDescription,
        language,
        selectedCategory,
        selectedRecipes,
        photoKey: initialSnapshot.photoKey,
    };
    const isDirty =
        photo.isDirty || differsFromSnapshot(current, initialSnapshot);

    const { isDirtyRef, markClean } = useDirtyRef(isDirty);

    return {
        menuTitle,
        language,
        setLanguage,
        menuDescription,
        selectedCategory,
        selectedRecipes,
        photo,
        errors,
        attachForm,
        setMenuTitle,
        setMenuDescription,
        setSelectedCategory,
        validateForm,
        toggleRecipeSelection: recipes.toggleRecipeSelection,
        removeRecipe: recipes.removeRecipe,
        reorderSelectedRecipes: recipes.reorderSelectedRecipes,
        setInitialValues,
        isDirty,
        isDirtyRef,
        markClean,
    };
};
