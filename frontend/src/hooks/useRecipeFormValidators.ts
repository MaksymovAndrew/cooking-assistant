import { useCallback } from "react";

import type {
    RecipeFormChangeMessages,
    RecipeFormCreateMessages,
    RecipeFormIngredient,
} from "types/recipeForm";

import { useRecipeFormValidation } from "hooks/useRecipeFormValidation";

interface RecipeFormValues {
    title: string;
    content: string;
    selectedIngredients: RecipeFormIngredient[];
    selectedTypeId: number | null;
    cookingHours: string;
    cookingMinutes: string;
}

export const useRecipeFormValidators = (values: RecipeFormValues) => {
    const {
        titleError,
        descriptionError,
        ingredientsError,
        typeError,
        cookingTimeError,
        attachForm,
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
        attachForm,
        validateCreate,
        validateChange,
    };
};
