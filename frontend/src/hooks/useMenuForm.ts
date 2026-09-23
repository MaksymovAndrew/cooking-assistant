import { useCallback, useState } from "react";

import type { MenuFormErrorMessages, MenuFormValues } from "types/menuForm";

import { useDirtyRef } from "hooks/useDirtyRef";
import { useMenuFormValidation } from "hooks/useMenuFormValidation";
import { useRecordPhotoDraft } from "hooks/useRecordPhotoDraft";

import { moveBefore, toggleValue } from "utils/listOrder";

export interface UseMenuFormOptions {
    errorMessages: MenuFormErrorMessages;
}

const BLANK_SNAPSHOT: MenuFormValues = {
    menuTitle: "",
    menuDescription: "",
    selectedCategory: null,
    selectedRecipes: [],
    photoKey: null,
};

export const useMenuForm = (options: UseMenuFormOptions) => {
    const [menuTitle, setMenuTitle] = useState("");
    const [menuDescription, setMenuDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );
    const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
    const [initialSnapshot, setInitialSnapshot] =
        useState<MenuFormValues>(BLANK_SNAPSHOT);
    const photo = useRecordPhotoDraft("menu");
    const { reset: resetPhoto } = photo;

    const { errors, validate } = useMenuFormValidation(options.errorMessages);

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

    const toggleRecipeSelection = useCallback((recipeId: number) => {
        setSelectedRecipes((prev) => toggleValue(prev, recipeId));
    }, []);

    const reorderSelectedRecipes = useCallback(
        (fromId: number, toId: number) => {
            setSelectedRecipes((prev) =>
                moveBefore(prev, prev.indexOf(fromId), prev.indexOf(toId)),
            );
        },
        [],
    );

    const setInitialValues = useCallback(
        (values: MenuFormValues) => {
            setMenuTitle(values.menuTitle);
            setMenuDescription(values.menuDescription);
            setSelectedCategory(values.selectedCategory);
            setSelectedRecipes(values.selectedRecipes);
            resetPhoto(values.photoKey);
            setInitialSnapshot(values);
        },
        [resetPhoto],
    );

    // the photo keeps its own dirty state: a picked file is not a value that serializes
    const current: MenuFormValues = {
        menuTitle,
        menuDescription,
        selectedCategory,
        selectedRecipes,
        photoKey: initialSnapshot.photoKey,
    };
    const isDirty =
        photo.isDirty ||
        JSON.stringify(current) !== JSON.stringify(initialSnapshot);

    const { isDirtyRef, markClean } = useDirtyRef(isDirty);

    return {
        menuTitle,
        menuDescription,
        selectedCategory,
        selectedRecipes,
        photo,
        errors,
        setMenuTitle,
        setMenuDescription,
        setSelectedCategory,
        validateForm,
        toggleRecipeSelection,
        reorderSelectedRecipes,
        setInitialValues,
        isDirty,
        isDirtyRef,
        markClean,
    };
};
