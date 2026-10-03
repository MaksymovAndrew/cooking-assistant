import { act } from "@testing-library/react";

import { useRecipeForm } from "hooks/useRecipeForm";

import { renderHookWithStore } from "test/store";

const fillValid = (form: ReturnType<typeof useRecipeForm>) => {
    form.setInitialValues({
        title: "Soup",
        content: "boil",
        language: "en",
        cookingHours: "0",
        cookingMinutes: "30",
        selectedTypeId: 5,
        selectedIngredients: [
            {
                id: 1,
                slug: "egg",
                name: "Egg",
                quantity: 1,
                unit_name: "pcs",
                calories_per_unit: null,
            },
        ],
        caloriesOverride: "",
        photoKey: null,
    });
};

describe("useRecipeForm", () => {
    it("should start a new recipe in the page's language", () => {
        const { result } = renderHookWithStore(() => useRecipeForm());

        expect(result.current.language).toBe("en");
    });

    it("should count a changed language as an edit", () => {
        const { result } = renderHookWithStore(() => useRecipeForm());

        act(() => {
            fillValid(result.current);
        });
        act(() => {
            result.current.setLanguage("ru");
        });

        expect(result.current.language).toBe("ru");
        expect(result.current.isDirty).toBe(true);
    });

    it("should populate every field via setInitialValues", () => {
        const { result } = renderHookWithStore(() => useRecipeForm());

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
        const { result } = renderHookWithStore(() => useRecipeForm());

        act(() => {
            fillValid(result.current);
        });

        expect(result.current.isDirty).toBe(false);

        act(() => {
            result.current.setTitle("Different soup");
        });

        expect(result.current.isDirty).toBe(true);
    });
});
