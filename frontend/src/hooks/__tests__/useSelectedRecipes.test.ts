import { act, renderHook } from "@testing-library/react";

import type { RecipeListItem } from "types/recipe";

import { useSelectedRecipes } from "hooks/useSelectedRecipes";

import { recipeIdsOf } from "utils/menuFormRecipes";

const recipe = (id: number): RecipeListItem => ({
    id,
    title: `Recipe ${id}`,
    type_name: null,
    creation_date: "2026-01-01",
    cooking_time: 10,
});

const selectFour = () => {
    const view = renderHook(() => useSelectedRecipes());

    act(() => {
        [1, 2, 3, 4].forEach((id) => {
            view.result.current.toggleRecipeSelection(recipe(id));
        });
    });

    return view;
};

describe("useSelectedRecipes", () => {
    it("should add a recipe once and take it back on a second toggle", () => {
        const { result } = renderHook(() => useSelectedRecipes());

        act(() => {
            result.current.toggleRecipeSelection(recipe(5));
        });

        expect(result.current.selectedRecipes).toEqual([recipe(5)]);

        act(() => {
            result.current.toggleRecipeSelection(recipe(5));
        });

        expect(result.current.selectedRecipes).toEqual([]);
    });

    it("should keep only the fields the form shows from a picked search result", () => {
        const { result } = renderHook(() => useSelectedRecipes());
        const searchResult = { ...recipe(5), language: "en", ingredients: [] };

        act(() => {
            result.current.toggleRecipeSelection(searchResult);
        });

        expect(result.current.selectedRecipes).toEqual([recipe(5)]);
    });

    it("should remove a recipe by its id", () => {
        const { result } = selectFour();

        act(() => {
            result.current.removeRecipe(2);
        });

        expect(recipeIdsOf(result.current.selectedRecipes)).toEqual([1, 3, 4]);
    });

    it("should move a recipe to land right before a target further down the list", () => {
        const { result } = selectFour();

        act(() => {
            result.current.reorderSelectedRecipes(1, 4);
        });

        expect(recipeIdsOf(result.current.selectedRecipes)).toEqual([
            2, 3, 1, 4,
        ]);
    });
});
