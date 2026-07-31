import { act, renderHook } from "@testing-library/react";

import { useMenuForm } from "hooks/useMenuForm";

import { ERROR_RECIPES_REQUIRED } from "test/constants";

const ERROR_MESSAGES = {
    emptyTitle: "Menu title cannot be empty.",
    emptyDescription: "Menu description cannot be empty.",
    noCategory: "Please select a menu category.",
    noRecipes: ERROR_RECIPES_REQUIRED,
};

describe("useMenuForm", () => {
    it("should initialise with empty form state", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        expect(result.current.menuTitle).toBe("");
        expect(result.current.selectedCategory).toBeNull();
        expect(result.current.selectedRecipes).toEqual([]);
    });

    it("should set errors when form is invalid", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        let isValid = false;

        act(() => {
            isValid = result.current.validateForm();
        });

        expect(isValid).toBe(false);
        expect(result.current.errors.menuTitleError).toBe(
            ERROR_MESSAGES.emptyTitle,
        );
        expect(result.current.errors.menuDescriptionError).toBe(
            ERROR_MESSAGES.emptyDescription,
        );
    });

    it("should toggle recipe selection", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.toggleRecipeSelection(5);
        });

        expect(result.current.selectedRecipes).toContain(5);

        act(() => {
            result.current.toggleRecipeSelection(5);
        });

        expect(result.current.selectedRecipes).not.toContain(5);
    });

    it("should populate form via setInitialValues", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.setInitialValues({
                menuTitle: "Soup week",
                menuDescription: "All soups",
                selectedCategory: 2,
                selectedRecipes: [1, 3],
            });
        });

        expect(result.current.menuTitle).toBe("Soup week");
        expect(result.current.selectedCategory).toBe(2);
        expect(result.current.selectedRecipes).toEqual([1, 3]);
    });

    it("should return true when all fields are valid", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.setInitialValues({
                menuTitle: "Weekly",
                menuDescription: "Good meals",
                selectedCategory: 1,
                selectedRecipes: [2],
            });
        });

        let isValid = false;

        act(() => {
            isValid = result.current.validateForm();
        });

        expect(isValid).toBe(true);
        expect(result.current.errors.menuTitleError).toBeNull();
        expect(result.current.errors.categoryError).toBeNull();
        expect(result.current.errors.recipesError).toBeNull();
    });

    it("should set categoryError when category is null", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.setMenuTitle("Title");
            result.current.setMenuDescription("Desc");
        });

        act(() => {
            result.current.validateForm();
        });

        expect(result.current.errors.categoryError).toBe(
            ERROR_MESSAGES.noCategory,
        );
    });

    it("should set recipesError when no recipes selected", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.setInitialValues({
                menuTitle: "Title",
                menuDescription: "Desc",
                selectedCategory: 1,
                selectedRecipes: [],
            });
        });

        act(() => {
            result.current.validateForm();
        });

        expect(result.current.errors.recipesError).toBe(
            ERROR_MESSAGES.noRecipes,
        );
    });

    it("should treat whitespace-only title as empty and set error", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.setMenuTitle("   ");
        });

        act(() => {
            result.current.validateForm();
        });

        expect(result.current.errors.menuTitleError).toBe(
            ERROR_MESSAGES.emptyTitle,
        );
    });

    it("should clear errors on a subsequent successful validation", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.validateForm();
        });

        expect(result.current.errors.menuTitleError).toBeTruthy();

        act(() => {
            result.current.setInitialValues({
                menuTitle: "Fixed title",
                menuDescription: "Fixed desc",
                selectedCategory: 1,
                selectedRecipes: [3],
            });
        });

        act(() => {
            result.current.validateForm();
        });

        expect(result.current.errors.menuTitleError).toBeNull();
        expect(result.current.errors.menuDescriptionError).toBeNull();
        expect(result.current.errors.categoryError).toBeNull();
        expect(result.current.errors.recipesError).toBeNull();
    });

    // the dragged recipe always ends up immediately before the drop target - moving it forward
    // past other rows must land it there too, not one slot further (a splice-based reorder has
    // to adjust the target index for the shift caused by removing the dragged item)
    it("should move a recipe to land right before a target further down the list", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.toggleRecipeSelection(1);
            result.current.toggleRecipeSelection(2);
            result.current.toggleRecipeSelection(3);
            result.current.toggleRecipeSelection(4);
        });

        act(() => {
            result.current.reorderSelectedRecipes(1, 4);
        });

        expect(result.current.selectedRecipes).toEqual([2, 3, 1, 4]);
    });

    it("should move a recipe to land right before a target further up the list", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.toggleRecipeSelection(1);
            result.current.toggleRecipeSelection(2);
            result.current.toggleRecipeSelection(3);
            result.current.toggleRecipeSelection(4);
        });

        act(() => {
            result.current.reorderSelectedRecipes(4, 1);
        });

        expect(result.current.selectedRecipes).toEqual([4, 1, 2, 3]);
    });

    it("should do nothing when reordering an unknown recipe id", () => {
        const { result } = renderHook(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.toggleRecipeSelection(1);
            result.current.toggleRecipeSelection(2);
        });

        act(() => {
            result.current.reorderSelectedRecipes(999, 2);
        });

        expect(result.current.selectedRecipes).toEqual([1, 2]);
    });
});
