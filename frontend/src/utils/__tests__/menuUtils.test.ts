import type { MenuDetailRecipe, MissingIngredient } from "types/menu";

import {
    type AggregatedIngredient,
    aggregateMenuIngredients,
    countMissingIngredients,
    menuCaloriesPerPortion,
    menuTotalCookingTime,
    missingShoppingItems,
} from "utils/menuUtils";

const missing = (
    ingredientId: number,
    neededQuantity: number,
    missingQuantity: number,
): MissingIngredient => ({
    ingredient_id: ingredientId,
    ingredient_slug: `slug-${ingredientId}`,
    ingredient_name: `Ingredient ${ingredientId}`,
    needed_quantity: neededQuantity,
    missing_quantity: missingQuantity,
    unit_name: "g",
});

const menuRecipe = (
    recipeId: number,
    missingIngredients?: MissingIngredient[],
): MenuDetailRecipe => ({
    recipe_id: recipeId,
    title: `Recipe ${recipeId}`,
    language: "en",
    type_name: null,
    cooking_time: 10,
    creation_date: "2026-01-01T00:00:00.000Z",
    calories_per_portion: null,
    photo_key: null,
    ratingAverage: null,
    ratingCount: 0,
    missingIngredients,
});

describe("aggregateMenuIngredients", () => {
    it("should handle recipes where missingIngredients is undefined", () => {
        expect(aggregateMenuIngredients([menuRecipe(1)])).toEqual({});
    });

    it("should aggregate needed and missing quantities for the same ingredient across recipes", () => {
        const result = aggregateMenuIngredients([
            menuRecipe(1, [missing(10, 100, 100)]),
            menuRecipe(2, [missing(10, 200, 200)]),
        ]);

        expect(result[10]).toEqual({
            slug: "slug-10",
            name: "Ingredient 10",
            quantity: 300,
            missingQuantity: 300,
            unit: "g",
            sufficient: false,
        });
    });

    it("should keep separate entries for different ingredients", () => {
        const result = aggregateMenuIngredients([
            menuRecipe(1, [missing(20, 5, 5), missing(21, 2, 2)]),
        ]);

        expect(result[20].quantity).toBe(5);
        expect(result[21].quantity).toBe(2);
    });

    it("should always show the total needed quantity, even when sufficient", () => {
        const result = aggregateMenuIngredients([
            menuRecipe(1, [missing(40, 3, 0)]),
        ]);

        expect(result[40].quantity).toBe(3);
        expect(result[40].sufficient).toBe(true);
    });

    it("should mark an ingredient insufficient once any recipe still needs more", () => {
        const recipes = [
            menuRecipe(1, [missing(50, 2, 0)]),
            menuRecipe(2, [missing(50, 2, 2)]),
        ];

        expect(aggregateMenuIngredients(recipes)[50].sufficient).toBe(false);
    });
});

describe("menuCaloriesPerPortion", () => {
    const withCalories = (calories: number | null): MenuDetailRecipe => ({
        ...menuRecipe(1),
        calories_per_portion: calories,
    });

    it("should add up every recipe's calories", () => {
        expect(
            menuCaloriesPerPortion([withCalories(300), withCalories(450)]),
        ).toBe(750);
    });

    it("should be unknown as soon as one recipe's calories are", () => {
        expect(
            menuCaloriesPerPortion([withCalories(300), withCalories(null)]),
        ).toBeNull();
    });

    it("should be unknown for a menu without recipes", () => {
        expect(menuCaloriesPerPortion([])).toBeNull();
    });
});

describe("menuTotalCookingTime", () => {
    it("should add up every recipe's cooking time", () => {
        const recipes = [
            { ...menuRecipe(1), cooking_time: 25 },
            { ...menuRecipe(2), cooking_time: 10 },
        ];

        expect(menuTotalCookingTime(recipes)).toBe(35);
    });
});

describe("missing ingredients", () => {
    const aggregated = (missingQuantity: number): AggregatedIngredient => ({
        slug: "onion",
        name: "Onion",
        quantity: 3,
        missingQuantity,
        unit: "pcs",
        sufficient: missingQuantity === 0,
    });
    const ingredients = { 50: aggregated(1.23456), 51: aggregated(0) };

    it("should count only the ingredients still short", () => {
        expect(countMissingIngredients(ingredients)).toBe(1);
    });

    it("should put only the rounded shortfall on the shopping list", () => {
        expect(missingShoppingItems(ingredients)).toEqual([
            { ingredient_id: 50, quantity: 1.23 },
        ]);
    });
});
