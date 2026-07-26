import { act, renderHook } from "@testing-library/react";

import type { Ingredient } from "types/ingredient";

import { useRecipeForm } from "hooks/useRecipeForm";

const INGREDIENT: Ingredient = {
    id: 1,
    slug: "egg",
    name: "Egg",
    category: "eggs",
    unit_name: "piece",
    allergens: ["eggs"],
    days_to_expire: null,
    calories_per_unit: null,
};

const CREATE_MESSAGES = {
    errorTitle: "Title required",
    errorDescription: "Description required",
    errorIngredients: "Pick an ingredient",
    errorType: "Pick a type",
    errorCookingTimeFormat: "Bad time format",
    errorCookingTimeInvalid: "Invalid time",
};

const fillValid = (form: ReturnType<typeof useRecipeForm>) => {
    form.setInitialValues({
        title: "Soup",
        content: "boil",
        cookingHours: "0",
        cookingMinutes: "30",
        selectedTypeId: 5,
        selectedIngredients: [
            { id: 1, slug: "egg", name: "Egg", quantity: 1, unit_name: "pcs" },
        ],
    });
};

describe("useRecipeForm", () => {
    it("should initialise with empty state", () => {
        const { result } = renderHook(() => useRecipeForm());

        expect(result.current.title).toBe("");
        expect(result.current.selectedIngredients).toEqual([]);
        expect(result.current.selectedTypeId).toBeNull();
    });

    it("should update fields through their setters", () => {
        const { result } = renderHook(() => useRecipeForm());

        act(() => {
            result.current.setTitle("Borscht");
            result.current.setCookingHours("1");
        });

        expect(result.current.title).toBe("Borscht");
        expect(result.current.cookingHours).toBe("1");
    });

    it("should toggle an ingredient into and back out of the selection", () => {
        const { result } = renderHook(() => useRecipeForm());

        act(() => {
            result.current.toggleIngredientSelection(INGREDIENT);
        });

        expect(result.current.selectedIngredients).toHaveLength(1);

        act(() => {
            result.current.toggleIngredientSelection(INGREDIENT);
        });

        expect(result.current.selectedIngredients).toHaveLength(0);
    });

    it("should clamp an ingredient quantity to a minimum of one", () => {
        const { result } = renderHook(() => useRecipeForm());

        act(() => {
            result.current.toggleIngredientSelection(INGREDIENT);
        });
        act(() => {
            result.current.updateIngredientQuantity(INGREDIENT.id, 0);
        });

        expect(result.current.selectedIngredients[0].quantity).toBe(1);
    });

    it("should populate every field via setInitialValues", () => {
        const { result } = renderHook(() => useRecipeForm());

        act(() => {
            fillValid(result.current);
        });

        expect(result.current.title).toBe("Soup");
        expect(result.current.cookingHours).toBe("0");
        expect(result.current.cookingMinutes).toBe("30");
        expect(result.current.selectedTypeId).toBe(5);
        expect(result.current.selectedIngredients).toHaveLength(1);
    });

    it("should not be dirty right after setInitialValues, but dirty after a further edit", () => {
        const { result } = renderHook(() => useRecipeForm());

        act(() => {
            fillValid(result.current);
        });

        expect(result.current.isDirty).toBe(false);

        act(() => {
            result.current.setTitle("Different soup");
        });

        expect(result.current.isDirty).toBe(true);
    });

    it("should fail validateCreate and set the title error when empty", () => {
        const { result } = renderHook(() => useRecipeForm());

        let valid = true;

        act(() => {
            valid = result.current.validateCreate(CREATE_MESSAGES);
        });

        expect(valid).toBe(false);
        expect(result.current.titleError).toBe(CREATE_MESSAGES.errorTitle);
    });

    it("should pass validateCreate when every field is valid", () => {
        const { result } = renderHook(() => useRecipeForm());

        act(() => {
            fillValid(result.current);
        });

        let valid = false;

        act(() => {
            valid = result.current.validateCreate(CREATE_MESSAGES);
        });

        expect(valid).toBe(true);
        expect(result.current.titleError).toBeNull();
    });
});
