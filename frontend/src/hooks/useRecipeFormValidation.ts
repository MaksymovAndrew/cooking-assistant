import { useCallback, useState } from "react";

import type {
    RecipeFormChangeMessages,
    RecipeFormCreateMessages,
} from "types/recipeForm";

import { useFocusFirstInvalid } from "hooks/useFocusFirstInvalid";

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

export const useRecipeFormValidation = () => {
    const [errors, setErrors] = useState<RecipeFormErrors>(NO_ERRORS);
    const { attachForm, focusFirstInvalid } = useFocusFirstInvalid();

    const validateCreate = useCallback(
        (values: RecipeFormValues, messages: RecipeFormCreateMessages) => {
            const next = recipeFormErrors(values, messages);

            setErrors(next);

            if (hasRecipeFormErrors(next)) {
                focusFirstInvalid();

                return false;
            }

            return true;
        },
        [focusFirstInvalid],
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

            if (error !== null) {
                focusFirstInvalid();

                return false;
            }

            return true;
        },
        [focusFirstInvalid],
    );

    return { ...errors, attachForm, validateCreate, validateChange };
};
