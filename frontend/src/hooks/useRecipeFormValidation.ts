import { useCallback, useState } from "react";

import type {
    RecipeFormChangeMessages,
    RecipeFormCreateMessages,
} from "types/recipeForm";

import type {
    RecipeFormErrors,
    RecipeFormValues,
} from "utils/recipeFormValidation";
import {
    cookingTimeError,
    hasRecipeFormErrors,
    recipeFormErrors,
} from "utils/recipeFormValidation";

const NO_ERRORS: RecipeFormErrors = {
    titleError: null,
    descriptionError: null,
    ingredientsError: null,
    typeError: null,
    cookingTimeError: null,
};

// the rules live in utils/recipeFormValidation; this only keeps their verdict on screen
export const useRecipeFormValidation = () => {
    const [errors, setErrors] = useState<RecipeFormErrors>(NO_ERRORS);

    const validateCreate = useCallback(
        (values: RecipeFormValues, messages: RecipeFormCreateMessages) => {
            const next = recipeFormErrors(values, messages);

            setErrors(next);

            return !hasRecipeFormErrors(next);
        },
        [],
    );

    // an edit only re-checks the cooking time; the other fields keep whatever they showed
    const validateChange = useCallback(
        (
            values: Pick<RecipeFormValues, "cookingHours" | "cookingMinutes">,
            messages: RecipeFormChangeMessages,
        ) => {
            const error = cookingTimeError(
                values.cookingHours,
                values.cookingMinutes,
                messages,
            );

            setErrors((current) => ({ ...current, cookingTimeError: error }));

            return error === null;
        },
        [],
    );

    return { ...errors, validateCreate, validateChange };
};
