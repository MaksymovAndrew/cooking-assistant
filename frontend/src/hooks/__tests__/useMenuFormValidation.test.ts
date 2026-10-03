import { act, renderHook } from "@testing-library/react";

import type { MenuFormErrorMessages } from "types/menuForm";
import type { RecipeListItem } from "types/recipe";

import { useMenuFormValidation } from "hooks/useMenuFormValidation";

const MESSAGES: MenuFormErrorMessages = {
    emptyTitle: "Title is required",
    emptyDescription: "Description is required",
    noCategory: "Pick a category",
    noRecipes: "Pick a recipe",
};

const BORSCHT: RecipeListItem = {
    id: 7,
    title: "Borscht",
    type_name: "Soup",
    creation_date: "2026-01-01",
    cooking_time: 60,
};

const VALID = {
    menuTitle: "Week",
    menuDescription: "Dinners",
    selectedCategory: 2,
    selectedRecipes: [BORSCHT],
};

describe("useMenuFormValidation", () => {
    it("should pass a complete menu with no errors", () => {
        const { result } = renderHook(() => useMenuFormValidation(MESSAGES));
        let isValid = false;

        act(() => {
            isValid = result.current.validate(VALID);
        });

        expect(isValid).toBe(true);
        expect(result.current.errors).toEqual({
            menuTitleError: null,
            menuDescriptionError: null,
            categoryError: null,
            recipesError: null,
        });
    });

    it("should report every missing field at once", () => {
        const { result } = renderHook(() => useMenuFormValidation(MESSAGES));
        let isValid = true;

        act(() => {
            isValid = result.current.validate({
                menuTitle: "",
                menuDescription: "",
                selectedCategory: null,
                selectedRecipes: [],
            });
        });

        expect(isValid).toBe(false);
        expect(result.current.errors).toEqual({
            menuTitleError: MESSAGES.emptyTitle,
            menuDescriptionError: MESSAGES.emptyDescription,
            categoryError: MESSAGES.noCategory,
            recipesError: MESSAGES.noRecipes,
        });
    });

    it("should treat a whitespace-only title and description as empty", () => {
        const { result } = renderHook(() => useMenuFormValidation(MESSAGES));

        act(() => {
            result.current.validate({
                ...VALID,
                menuTitle: "   ",
                menuDescription: "\n",
            });
        });

        expect(result.current.errors.menuTitleError).toBe(MESSAGES.emptyTitle);
        expect(result.current.errors.menuDescriptionError).toBe(
            MESSAGES.emptyDescription,
        );
    });

    it("should clear an error once the field is fixed", () => {
        const { result } = renderHook(() => useMenuFormValidation(MESSAGES));

        act(() => {
            result.current.validate({ ...VALID, selectedRecipes: [] });
        });
        act(() => {
            result.current.validate(VALID);
        });

        expect(result.current.errors.recipesError).toBeNull();
    });
});
