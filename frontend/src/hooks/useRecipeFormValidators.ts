import { useCallback } from "react";

import type {
    RecipeFormChangeMessages,
    RecipeFormCreateMessages,
    RecipeFormIngredient,
} from "types/recipe";

import { useRecipeFormValidation } from "hooks/useRecipeFormValidation";

interface RecipeFormValues {
    title: string;
    content: string;
    selectedIngredients: RecipeFormIngredient[];
    selectedTypeId: number | null;
    cookingHours: string;
    cookingMinutes: string;
}

// binds the value-agnostic validation hook to the form's current values, so callers
// pass only the translated messages
export const useRecipeFormValidators = (values: RecipeFormValues) => {
    const {
        titleError,
        descriptionError,
        ingredientsError,
        typeError,
        cookingTimeError,
        validateCreate: validateCreateValues,
        validateChange: validateChangeValues,
    } = useRecipeFormValidation();

    const {
        title,
        content,
        selectedIngredients,
        selectedTypeId,
        cookingHours,
        cookingMinutes,
    } = values;

    const validateCreate = useCallback(
        (messages: RecipeFormCreateMessages) =>
            validateCreateValues(
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
            validateCreateValues,
        ],
    );

    const validateChange = useCallback(
        (messages: RecipeFormChangeMessages) =>
            validateChangeValues({ cookingHours, cookingMinutes }, messages),
        [cookingHours, cookingMinutes, validateChangeValues],
    );

    return {
        titleError,
        descriptionError,
        ingredientsError,
        typeError,
        cookingTimeError,
        validateCreate,
        validateChange,
    };
};
