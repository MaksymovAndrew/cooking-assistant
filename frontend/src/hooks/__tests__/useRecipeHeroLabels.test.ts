import { renderHook } from "@testing-library/react";

import type { RecipeDetails } from "types/recipe";

import { useRecipeHeroLabels } from "hooks/useRecipeHeroLabels";

import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";

const BORSCHT: RecipeDetails = {
    id: 7,
    title: "Borscht",
    language: "en",
    content: "Boil the beetroot.",
    ingredients: [],
    type_id: 2,
    type_name: "Soup",
    cooking_time: 90,
    creation_date: "2026-03-14T00:00:00.000Z",
    isOwner: false,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: false,
    containsAvoided: false,
    tags: [],
    calories_per_portion: 1234.4,
    calories_override: null,
};

describe("useRecipeHeroLabels", () => {
    it("should label the cooking time, calories and creation date", () => {
        const { result } = renderHook(() => useRecipeHeroLabels(BORSCHT, 1));

        expect(result.current).toEqual({
            formattedCookingTime: "1 hr 30 min",
            formattedCalories: "1,234 kcal / portion",
            totalCalories: null,
            formattedDate: "Mar 14, 2026",
        });
    });

    it("should total the calories over several portions from the rounded per-portion value", () => {
        const { result } = renderHook(() => useRecipeHeroLabels(BORSCHT, 3));

        expect(result.current.totalCalories).toBe("≈ 3,702 kcal total");
    });

    it("should show a placeholder for a recipe without a cooking time or calories", () => {
        const { result } = renderHook(() =>
            useRecipeHeroLabels(
                { ...BORSCHT, cooking_time: null, calories_per_portion: null },
                3,
            ),
        );

        expect(result.current.formattedCookingTime).toBe("—");
        expect(result.current.formattedCalories).toBe("—");
        expect(result.current.totalCalories).toBeNull();
    });
});
