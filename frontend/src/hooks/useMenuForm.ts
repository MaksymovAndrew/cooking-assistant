import { useCallback, useMemo, useState } from "react";

import { useDirtyRef } from "hooks/useDirtyRef";
import type { MenuFormErrorMessages } from "hooks/useMenuFormValidation";
import { useMenuFormValidation } from "hooks/useMenuFormValidation";

export interface MenuFormValues {
    menuTitle: string;
    menuDescription: string;
    selectedCategory: number | null;
    selectedRecipes: number[];
}

export interface UseMenuFormOptions {
    errorMessages: MenuFormErrorMessages;
}

const BLANK_SNAPSHOT: MenuFormValues = {
    menuTitle: "",
    menuDescription: "",
    selectedCategory: null,
    selectedRecipes: [],
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
        setSelectedRecipes((prevSelected) =>
            prevSelected.includes(recipeId)
                ? prevSelected.filter((id) => id !== recipeId)
                : [...prevSelected, recipeId],
        );
    }, []);

    const reorderSelectedRecipes = useCallback(
        (fromId: number, toId: number) => {
            setSelectedRecipes((prev) => {
                const fromIndex = prev.indexOf(fromId);
                const toIndex = prev.indexOf(toId);
                const isNoOpReorder =
                    fromIndex === -1 || toIndex === -1 || fromIndex === toIndex;

                if (isNoOpReorder) {
                    return prev;
                }

                const next = [...prev];
                const [moved] = next.splice(fromIndex, 1);

                next.splice(toIndex, 0, moved);

                return next;
            });
        },
        [],
    );

    const setInitialValues = useCallback((values: MenuFormValues) => {
        setMenuTitle(values.menuTitle);
        setMenuDescription(values.menuDescription);
        setSelectedCategory(values.selectedCategory);
        setSelectedRecipes(values.selectedRecipes);
        setInitialSnapshot(values);
    }, []);

    const isDirty = useMemo(() => {
        const current: MenuFormValues = {
            menuTitle,
            menuDescription,
            selectedCategory,
            selectedRecipes,
        };

        return JSON.stringify(current) !== JSON.stringify(initialSnapshot);
    }, [
        menuTitle,
        menuDescription,
        selectedCategory,
        selectedRecipes,
        initialSnapshot,
    ]);

    const { isDirtyRef, markClean } = useDirtyRef(isDirty);

    return {
        menuTitle,
        menuDescription,
        selectedCategory,
        selectedRecipes,
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
