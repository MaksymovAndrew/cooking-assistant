import { useCallback, useMemo, useState } from "react";

import type { RecipeFormInitialValues } from "types/recipe";

import { useDirtyRef } from "hooks/useDirtyRef";
import { useRecipeFormValidators } from "hooks/useRecipeFormValidators";
import { useSelectedIngredients } from "hooks/useSelectedIngredients";

const BLANK_SNAPSHOT: RecipeFormInitialValues = {
    title: "",
    content: "",
    cookingHours: "",
    cookingMinutes: "",
    selectedTypeId: null,
    selectedIngredients: [],
    caloriesOverride: "",
};

export const useRecipeForm = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [cookingHours, setCookingHours] = useState("");
    const [cookingMinutes, setCookingMinutes] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [caloriesOverride, setCaloriesOverride] = useState("");
    const [initialSnapshot, setInitialSnapshot] =
        useState<RecipeFormInitialValues>(BLANK_SNAPSHOT);

    const {
        selectedIngredients,
        setSelectedIngredients,
        toggleIngredientSelection,
        updateIngredientQuantity,
        removeIngredient,
        reorderIngredients,
    } = useSelectedIngredients();

    const {
        titleError,
        descriptionError,
        ingredientsError,
        typeError,
        cookingTimeError,
        validateCreate,
        validateChange,
    } = useRecipeFormValidators({
        title,
        content,
        selectedIngredients,
        selectedTypeId,
        cookingHours,
        cookingMinutes,
    });

    const setInitialValues = useCallback(
        (values: RecipeFormInitialValues) => {
            setTitle(values.title);
            setContent(values.content);
            setCookingHours(values.cookingHours);
            setCookingMinutes(values.cookingMinutes);
            setSelectedTypeId(values.selectedTypeId);
            setSelectedIngredients(values.selectedIngredients);
            setCaloriesOverride(values.caloriesOverride);
            setInitialSnapshot(values);
        },
        [setSelectedIngredients],
    );

    const isDirty = useMemo(() => {
        const current: RecipeFormInitialValues = {
            title,
            content,
            cookingHours,
            cookingMinutes,
            selectedTypeId,
            selectedIngredients,
            caloriesOverride,
        };

        return JSON.stringify(current) !== JSON.stringify(initialSnapshot);
    }, [
        title,
        content,
        cookingHours,
        cookingMinutes,
        selectedTypeId,
        selectedIngredients,
        caloriesOverride,
        initialSnapshot,
    ]);

    const { isDirtyRef, markClean } = useDirtyRef(isDirty);

    return {
        title,
        setTitle,
        content,
        setContent,
        cookingHours,
        setCookingHours,
        cookingMinutes,
        setCookingMinutes,
        selectedIngredients,
        selectedTypeId,
        setSelectedTypeId,
        caloriesOverride,
        setCaloriesOverride,
        titleError,
        descriptionError,
        ingredientsError,
        typeError,
        cookingTimeError,
        toggleIngredientSelection,
        updateIngredientQuantity,
        removeIngredient,
        reorderIngredients,
        validateCreate,
        validateChange,
        setInitialValues,
        isDirty,
        isDirtyRef,
        markClean,
    };
};
