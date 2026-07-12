import { useCallback, useState } from "react";

import { MINUTES_PER_HOUR } from "constants/time";
import type {
    RecipeFormChangeMessages,
    RecipeFormCreateMessages,
    RecipeFormIngredient,
} from "types/recipe";

const MAX_HOURS = 99;

const isValidCookingTime = (
    hours: string,
    minutes: string,
    setCookingTimeError: (e: string | null) => void,
    messages: {
        errorCookingTimeFormat: string;
        errorCookingTimeInvalid: string;
    },
): boolean => {
    if (hours.trim() === "" || minutes.trim() === "") {
        setCookingTimeError(messages.errorCookingTimeFormat);

        return false;
    }

    const parsedHours = Number(hours);
    const parsedMinutes = Number(minutes);
    const isInvalid =
        !Number.isInteger(parsedHours) ||
        !Number.isInteger(parsedMinutes) ||
        parsedHours < 0 ||
        parsedHours > MAX_HOURS ||
        parsedMinutes < 0 ||
        parsedMinutes >= MINUTES_PER_HOUR ||
        (parsedHours === 0 && parsedMinutes === 0);

    if (isInvalid) {
        setCookingTimeError(messages.errorCookingTimeInvalid);

        return false;
    }

    return true;
};

export const useRecipeFormValidation = () => {
    const [titleError, setTitleError] = useState<string | null>(null);
    const [descriptionError, setDescriptionError] = useState<string | null>(
        null,
    );
    const [ingredientsError, setIngredientsError] = useState<string | null>(
        null,
    );
    const [typeError, setTypeError] = useState<string | null>(null);
    const [cookingTimeError, setCookingTimeError] = useState<string | null>(
        null,
    );

    const validateCreate = useCallback(
        (
            values: {
                title: string;
                content: string;
                selectedIngredients: RecipeFormIngredient[];
                selectedTypeId: number | null;
                cookingHours: string;
                cookingMinutes: string;
            },
            messages: RecipeFormCreateMessages,
        ): boolean => {
            let valid = true;

            if (!values.title.trim()) {
                setTitleError(messages.errorTitle);
                valid = false;
            } else {
                setTitleError(null);
            }

            if (!values.content.trim()) {
                setDescriptionError(messages.errorDescription);
                valid = false;
            } else {
                setDescriptionError(null);
            }

            if (values.selectedIngredients.length === 0) {
                setIngredientsError(messages.errorIngredients);
                valid = false;
            } else {
                setIngredientsError(null);
            }

            if (values.selectedTypeId === null) {
                setTypeError(messages.errorType);
                valid = false;
            } else {
                setTypeError(null);
            }

            setCookingTimeError(null);
            const timeValid = isValidCookingTime(
                values.cookingHours,
                values.cookingMinutes,
                setCookingTimeError,
                messages,
            );

            return valid && timeValid;
        },
        [],
    );

    const validateChange = useCallback(
        (
            values: { cookingHours: string; cookingMinutes: string },
            messages: RecipeFormChangeMessages,
        ): boolean =>
            isValidCookingTime(
                values.cookingHours,
                values.cookingMinutes,
                setCookingTimeError,
                messages,
            ),
        [],
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
