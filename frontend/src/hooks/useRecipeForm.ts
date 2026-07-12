import { useCallback, useMemo, useState } from "react";

import type {
    RecipeFormChangeMessages,
    RecipeFormCreateMessages,
    RecipeFormInitialValues,
} from "types/recipe";

import { useDirtyRef } from "hooks/useDirtyRef";
import { useRecipeFormValidation } from "hooks/useRecipeFormValidation";
import { useSelectedIngredients } from "hooks/useSelectedIngredients";

const BLANK_SNAPSHOT: RecipeFormInitialValues = {
    title: "",
    content: "",
    cookingHours: "",
    cookingMinutes: "",
    selectedTypeId: null,
    selectedIngredients: [],
};

export const useRecipeForm = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [cookingHours, setCookingHours] = useState("");
    const [cookingMinutes, setCookingMinutes] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
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
        validateCreate: _validateCreate,
        validateChange: _validateChange,
    } = useRecipeFormValidation();

    const validateCreate = useCallback(
        (messages: RecipeFormCreateMessages) =>
            _validateCreate(
                {
                    title,
                    content,
                    selectedIngredients,
                    selectedTypeId,
                    cookingHours,
                    cookingMinutes,
                },
                messages,
            ),
        [
            title,
            content,
            selectedIngredients,
            selectedTypeId,
            cookingHours,
            cookingMinutes,
            _validateCreate,
        ],
    );

    const validateChange = useCallback(
        (messages: RecipeFormChangeMessages) =>
            _validateChange({ cookingHours, cookingMinutes }, messages),
        [cookingHours, cookingMinutes, _validateChange],
    );

    const setInitialValues = useCallback(
        (values: RecipeFormInitialValues) => {
            setTitle(values.title);
            setContent(values.content);
            setCookingHours(values.cookingHours);
            setCookingMinutes(values.cookingMinutes);
            setSelectedTypeId(values.selectedTypeId);
            setSelectedIngredients(values.selectedIngredients);
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
        };

        return JSON.stringify(current) !== JSON.stringify(initialSnapshot);
    }, [
        title,
        content,
        cookingHours,
        cookingMinutes,
        selectedTypeId,
        selectedIngredients,
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
