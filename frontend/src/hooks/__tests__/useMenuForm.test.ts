import { act } from "@testing-library/react";

import type { RecipeListItem } from "types/recipe";

import { useMenuForm } from "hooks/useMenuForm";

import { recipeIdsOf } from "utils/menuFormRecipes";

import { ERROR_RECIPES_REQUIRED } from "test/constants";
import { renderHookWithStore } from "test/store";

const ERROR_MESSAGES = {
    emptyTitle: "Menu title cannot be empty.",
    emptyDescription: "Menu description cannot be empty.",
    noCategory: "Please select a menu category.",
    noRecipes: ERROR_RECIPES_REQUIRED,
};

const recipe = (id: number): RecipeListItem => ({
    id,
    title: `Recipe ${id}`,
    type_name: null,
    creation_date: "2026-01-01",
    cooking_time: 10,
});

describe("useMenuForm", () => {
    it("should start a new menu in the page's language, clean", () => {
        const { result } = renderHookWithStore(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        expect(result.current.language).toBe("en");
        expect(result.current.isDirty).toBe(false);
    });

    it("should keep a loaded menu's language and count changing it as an edit", () => {
        const { result } = renderHookWithStore(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.setInitialValues({
                menuTitle: "Tydzień zup",
                menuDescription: "Same zupy",
                language: "pl",
                selectedCategory: 2,
                selectedRecipes: [recipe(1)],
                photoKey: null,
            });
        });

        expect(result.current.language).toBe("pl");
        expect(result.current.isDirty).toBe(false);

        act(() => {
            result.current.setLanguage("uk");
        });

        expect(result.current.isDirty).toBe(true);
    });

    it("should populate form via setInitialValues", () => {
        const { result } = renderHookWithStore(() =>
            useMenuForm({ errorMessages: ERROR_MESSAGES }),
        );

        act(() => {
            result.current.setInitialValues({
                menuTitle: "Soup week",
                menuDescription: "All soups",
                language: "en",
                selectedCategory: 2,
                selectedRecipes: [recipe(1), recipe(3)],
                photoKey: null,
            });
        });

        expect(result.current.menuTitle).toBe("Soup week");
        expect(result.current.selectedCategory).toBe(2);
        expect(recipeIdsOf(result.current.selectedRecipes)).toEqual([1, 3]);
    });
});
