import type { RecipeFormCreateMessages } from "types/recipeForm";

import {
    cookingTimeError,
    hasRecipeFormErrors,
    recipeFormErrors,
} from "utils/recipeFormValidation";

const MESSAGES: RecipeFormCreateMessages = {
    errorTitle: "title",
    errorDescription: "description",
    errorIngredients: "ingredients",
    errorType: "type",
    errorCookingTimeFormat: "format",
    errorCookingTimeInvalid: "invalid",
};

const VALID = {
    title: "Soup",
    content: "Boil",
    selectedIngredients: [
        {
            id: 1,
            slug: "carrot",
            name: "Carrot",
            unit_name: "g",
            quantity: 1,
            calories_per_unit: null,
        },
    ],
    selectedTypeId: 2,
    cookingHours: "0",
    cookingMinutes: "30",
};

describe("cookingTimeError", () => {
    it("should accept a whole time above zero", () => {
        expect(cookingTimeError("1", "30", MESSAGES)).toBeNull();
    });

    it("should ask for both parts when one is empty", () => {
        expect(cookingTimeError("", "30", MESSAGES)).toBe("format");
    });

    it("should reject a zero time", () => {
        expect(cookingTimeError("0", "0", MESSAGES)).toBe("invalid");
    });

    it("should reject minutes past the hour", () => {
        expect(cookingTimeError("1", "60", MESSAGES)).toBe("invalid");
    });

    it("should reject more than 99 hours", () => {
        expect(cookingTimeError("100", "0", MESSAGES)).toBe("invalid");
    });

    it("should reject a fractional part", () => {
        expect(cookingTimeError("1.5", "0", MESSAGES)).toBe("invalid");
    });
});

describe("recipeFormErrors", () => {
    it("should report no errors for a complete recipe", () => {
        expect(hasRecipeFormErrors(recipeFormErrors(VALID, MESSAGES))).toBe(
            false,
        );
    });

    it("should report every missing field at once", () => {
        expect(
            recipeFormErrors(
                {
                    ...VALID,
                    title: " ",
                    content: "",
                    selectedIngredients: [],
                    selectedTypeId: null,
                },
                MESSAGES,
            ),
        ).toEqual({
            titleError: "title",
            descriptionError: "description",
            ingredientsError: "ingredients",
            typeError: "type",
            cookingTimeError: null,
        });
    });
});
