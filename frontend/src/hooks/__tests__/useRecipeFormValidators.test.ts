import { act, renderHook } from "@testing-library/react";

import type { RecipeFormIngredient } from "types/recipeForm";

import { useRecipeFormValidators } from "hooks/useRecipeFormValidators";

const MESSAGES = {
    errorTitle: "Title is required.",
    errorDescription: "Description is required.",
    errorIngredients: "Add at least one ingredient.",
    errorType: "Select a recipe type.",
    errorCookingTimeFormat: "Enter hours and minutes.",
    errorCookingTimeInvalid: "Cooking time is invalid.",
};

const CHANGE_MESSAGES = {
    errorCookingTimeFormat: "Enter hours and minutes.",
    errorCookingTimeInvalid: "Cooking time is invalid.",
};

const BEET: RecipeFormIngredient = {
    id: 1,
    slug: "beet",
    name: "Beet",
    quantity: 1,
    unit_name: "kg",
    calories_per_unit: null,
};

type Values = Parameters<typeof useRecipeFormValidators>[0];

const VALID: Values = {
    title: "Borscht",
    content: "Boil beets.",
    selectedIngredients: [BEET],
    selectedTypeId: 2,
    cookingHours: "1",
    cookingMinutes: "30",
};

const renderValidators = (initial: Values) =>
    renderHook((values: Values) => useRecipeFormValidators(values), {
        initialProps: initial,
    });

describe("useRecipeFormValidators", () => {
    it("should validate the form's current values on create", () => {
        const { result, rerender } = renderValidators({ ...VALID, title: "" });

        rerender(VALID);

        let isValid = false;

        act(() => {
            isValid = result.current.validateCreate(MESSAGES);
        });

        expect(isValid).toBe(true);
        expect(result.current.titleError).toBeNull();
    });

    it("should surface the errors of a create that fails", () => {
        const { result } = renderValidators({
            ...VALID,
            selectedIngredients: [],
            selectedTypeId: null,
        });

        act(() => {
            result.current.validateCreate(MESSAGES);
        });

        expect(result.current.ingredientsError).toBe(MESSAGES.errorIngredients);
        expect(result.current.typeError).toBe(MESSAGES.errorType);
    });

    it("should check only the cooking time on change", () => {
        const { result } = renderValidators({
            ...VALID,
            title: "",
            cookingHours: "",
            cookingMinutes: "",
        });
        let isValid = true;

        act(() => {
            isValid = result.current.validateChange(CHANGE_MESSAGES);
        });

        expect(isValid).toBe(false);
        expect(result.current.titleError).toBeNull();
        expect(result.current.cookingTimeError).not.toBeNull();
    });
});
