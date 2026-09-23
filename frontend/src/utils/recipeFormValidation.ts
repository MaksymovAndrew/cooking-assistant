import { MINUTES_PER_HOUR } from "constants/time";
import type {
    RecipeFormChangeMessages,
    RecipeFormCreateMessages,
    RecipeFormIngredient,
} from "types/recipeForm";

const MAX_HOURS = 99;

export interface RecipeFormValues {
    title: string;
    content: string;
    selectedIngredients: RecipeFormIngredient[];
    selectedTypeId: number | null;
    cookingHours: string;
    cookingMinutes: string;
}

export interface RecipeFormErrors {
    titleError: string | null;
    descriptionError: string | null;
    ingredientsError: string | null;
    typeError: string | null;
    cookingTimeError: string | null;
}

// a whole number of hours and minutes, not zero overall - the message says which rule failed
export const cookingTimeError = (
    hours: string,
    minutes: string,
    messages: RecipeFormChangeMessages,
): string | null => {
    if (hours.trim() === "" || minutes.trim() === "") {
        return messages.errorCookingTimeFormat;
    }

    const parsedHours = Number(hours);
    const parsedMinutes = Number(minutes);
    const isWholeTime =
        Number.isInteger(parsedHours) && Number.isInteger(parsedMinutes);
    const isInRange =
        parsedHours >= 0 &&
        parsedHours <= MAX_HOURS &&
        parsedMinutes >= 0 &&
        parsedMinutes < MINUTES_PER_HOUR;
    const isEmpty = parsedHours === 0 && parsedMinutes === 0;

    const isValidTime = isWholeTime && isInRange && !isEmpty;

    return isValidTime ? null : messages.errorCookingTimeInvalid;
};

// every rule runs, so one submit shows every problem at once
export const recipeFormErrors = (
    values: RecipeFormValues,
    messages: RecipeFormCreateMessages,
): RecipeFormErrors => ({
    titleError: values.title.trim() ? null : messages.errorTitle,
    descriptionError: values.content.trim() ? null : messages.errorDescription,
    ingredientsError:
        values.selectedIngredients.length === 0
            ? messages.errorIngredients
            : null,
    typeError: values.selectedTypeId === null ? messages.errorType : null,
    cookingTimeError: cookingTimeError(
        values.cookingHours,
        values.cookingMinutes,
        messages,
    ),
});

export const hasRecipeFormErrors = (errors: RecipeFormErrors): boolean =>
    Object.values(errors).some((error) => error !== null);
