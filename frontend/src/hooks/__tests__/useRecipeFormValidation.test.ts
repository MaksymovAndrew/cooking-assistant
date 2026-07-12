import { act, renderHook } from "@testing-library/react";

import { useRecipeFormValidation } from "hooks/useRecipeFormValidation";

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

const VALID_CREATE = {
    title: "Borscht",
    content: "Boil beets.",
    selectedIngredients: [
        { id: 1, name: "Beet", quantity: 1, unit_name: "kg" },
    ],
    selectedTypeId: 2,
    cookingHours: "1",
    cookingMinutes: "30",
};

describe("useRecipeFormValidation", () => {
    it("should return false and set titleError when title is empty", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = true;

        act(() => {
            valid = result.current.validateCreate(
                { ...VALID_CREATE, title: "" },
                MESSAGES,
            );
        });

        expect(valid).toBe(false);
        expect(result.current.titleError).toBe(MESSAGES.errorTitle);
        expect(result.current.descriptionError).toBeNull();
    });

    it("should return false and set descriptionError when content is empty", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = true;

        act(() => {
            valid = result.current.validateCreate(
                { ...VALID_CREATE, content: "" },
                MESSAGES,
            );
        });

        expect(valid).toBe(false);
        expect(result.current.descriptionError).toBe(MESSAGES.errorDescription);
        expect(result.current.titleError).toBeNull();
    });

    it("should return false and set ingredientsError when no ingredients selected", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = true;

        act(() => {
            valid = result.current.validateCreate(
                { ...VALID_CREATE, selectedIngredients: [] },
                MESSAGES,
            );
        });

        expect(valid).toBe(false);
        expect(result.current.ingredientsError).toBe(MESSAGES.errorIngredients);
    });

    it("should flag every invalid field in one pass", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        act(() => {
            result.current.validateCreate(
                { ...VALID_CREATE, title: "", content: "" },
                MESSAGES,
            );
        });

        expect(result.current.titleError).toBe(MESSAGES.errorTitle);
        expect(result.current.descriptionError).toBe(MESSAGES.errorDescription);
    });

    it("should return false and set typeError when no type selected", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = true;

        act(() => {
            valid = result.current.validateCreate(
                { ...VALID_CREATE, selectedTypeId: null },
                MESSAGES,
            );
        });

        expect(valid).toBe(false);
        expect(result.current.typeError).toBe(MESSAGES.errorType);
    });

    it("should return false and set cookingTimeError when hours or minutes are empty", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = true;

        act(() => {
            valid = result.current.validateCreate(
                { ...VALID_CREATE, cookingHours: "" },
                MESSAGES,
            );
        });

        expect(valid).toBe(false);
        expect(result.current.cookingTimeError).toBe(
            MESSAGES.errorCookingTimeFormat,
        );
    });

    it("should return false and set cookingTimeError when both hours and minutes are zero", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = true;

        act(() => {
            valid = result.current.validateCreate(
                { ...VALID_CREATE, cookingHours: "0", cookingMinutes: "0" },
                MESSAGES,
            );
        });

        expect(valid).toBe(false);
        expect(result.current.cookingTimeError).toBe(
            MESSAGES.errorCookingTimeInvalid,
        );
    });

    it("should return false and set cookingTimeError when minutes are out of range", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = true;

        act(() => {
            valid = result.current.validateCreate(
                { ...VALID_CREATE, cookingMinutes: "60" },
                MESSAGES,
            );
        });

        expect(valid).toBe(false);
        expect(result.current.cookingTimeError).toBe(
            MESSAGES.errorCookingTimeInvalid,
        );
    });

    it("should return true and clear all errors when all create fields are valid", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = false;

        act(() => {
            valid = result.current.validateCreate(VALID_CREATE, MESSAGES);
        });

        expect(valid).toBe(true);
        expect(result.current.titleError).toBeNull();
        expect(result.current.descriptionError).toBeNull();
        expect(result.current.ingredientsError).toBeNull();
        expect(result.current.typeError).toBeNull();
        expect(result.current.cookingTimeError).toBeNull();
    });

    it("should validateChange: return false when cooking time is empty", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = true;

        act(() => {
            valid = result.current.validateChange(
                { cookingHours: "", cookingMinutes: "" },
                CHANGE_MESSAGES,
            );
        });

        expect(valid).toBe(false);
        expect(result.current.cookingTimeError).toBe(
            CHANGE_MESSAGES.errorCookingTimeFormat,
        );
    });

    it("should validateChange: return false when cooking time is invalid", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = true;

        act(() => {
            valid = result.current.validateChange(
                { cookingHours: "0", cookingMinutes: "0" },
                CHANGE_MESSAGES,
            );
        });

        expect(valid).toBe(false);
        expect(result.current.cookingTimeError).toBe(
            CHANGE_MESSAGES.errorCookingTimeInvalid,
        );
    });

    it("should validateChange: return true for a valid cooking time", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = false;

        act(() => {
            valid = result.current.validateChange(
                { cookingHours: "0", cookingMinutes: "45" },
                CHANGE_MESSAGES,
            );
        });

        expect(valid).toBe(true);
        expect(result.current.cookingTimeError).toBeNull();
    });

    it("should validateChange: skip title, content, ingredients, and type checks", () => {
        const { result } = renderHook(() => useRecipeFormValidation());

        let valid = false;

        act(() => {
            valid = result.current.validateChange(
                { cookingHours: "0", cookingMinutes: "30" },
                CHANGE_MESSAGES,
            );
        });

        expect(valid).toBe(true);
        expect(result.current.typeError).toBeNull();
    });
});
