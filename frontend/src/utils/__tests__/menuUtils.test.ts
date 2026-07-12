import type { MenuDetailRecipe } from "types/menu";

import { aggregateMenuIngredients, groupRecipesByType } from "utils/menuUtils";

const makeRecipe = (
    id: number,
    type_name: string,
    missingIngredients?: MenuDetailRecipe["missingIngredients"],
): MenuDetailRecipe =>
    ({
        recipe_id: id,
        title: `Recipe ${id}`,
        type_name,
        missingIngredients,
    }) as MenuDetailRecipe;

describe("groupRecipesByType", () => {
    it("should return an empty object for an empty list", () => {
        expect(groupRecipesByType([])).toEqual({});
    });

    it("should group recipes with the same type_name together", () => {
        const recipes = [
            makeRecipe(1, "Soup"),
            makeRecipe(2, "Soup"),
            makeRecipe(3, "Salad"),
        ];

        const result = groupRecipesByType(recipes);

        expect(result.Soup).toHaveLength(2);
        expect(result.Salad).toHaveLength(1);
    });

    it("should create a separate group for each distinct type", () => {
        const recipes = [
            makeRecipe(1, "A"),
            makeRecipe(2, "B"),
            makeRecipe(3, "C"),
        ];

        expect(Object.keys(groupRecipesByType(recipes))).toHaveLength(3);
    });

    it("should preserve the original recipe objects in each group", () => {
        const recipe = makeRecipe(99, "Soup");
        const result = groupRecipesByType([recipe]);

        expect(result.Soup[0]).toBe(recipe);
    });
});

describe("aggregateMenuIngredients", () => {
    it("should return an empty object for an empty list", () => {
        expect(aggregateMenuIngredients([])).toEqual({});
    });

    it("should return an empty object when no recipe has any ingredients", () => {
        const recipes = [makeRecipe(1, "Soup", []), makeRecipe(2, "Salad", [])];

        expect(aggregateMenuIngredients(recipes)).toEqual({});
    });

    it("should handle recipes where missingIngredients is undefined", () => {
        const recipe = makeRecipe(1, "Soup");

        expect(aggregateMenuIngredients([recipe])).toEqual({});
    });

    it("should aggregate needed and missing quantities for the same ingredient across recipes", () => {
        const recipes = [
            makeRecipe(1, "Soup", [
                {
                    ingredient_name: "Flour",
                    needed_quantity: 100,
                    missing_quantity: 100,
                    unit_name: "g",
                },
            ]),
            makeRecipe(2, "Bread", [
                {
                    ingredient_name: "Flour",
                    needed_quantity: 200,
                    missing_quantity: 200,
                    unit_name: "g",
                },
            ]),
        ];

        const result = aggregateMenuIngredients(recipes);

        expect(result.Flour.quantity).toBe(300);
        expect(result.Flour.missingQuantity).toBe(300);
        expect(result.Flour.unit).toBe("g");
    });

    it("should keep separate entries for different ingredients", () => {
        const recipes = [
            makeRecipe(1, "Soup", [
                {
                    ingredient_name: "Salt",
                    needed_quantity: 5,
                    missing_quantity: 5,
                    unit_name: "g",
                },
                {
                    ingredient_name: "Pepper",
                    needed_quantity: 2,
                    missing_quantity: 2,
                    unit_name: "g",
                },
            ]),
        ];

        const result = aggregateMenuIngredients(recipes);

        expect(result.Salt.quantity).toBe(5);
        expect(result.Pepper.quantity).toBe(2);
    });

    it("should use the unit from the first occurrence of each ingredient", () => {
        const recipes = [
            makeRecipe(1, "A", [
                {
                    ingredient_name: "Sugar",
                    needed_quantity: 10,
                    missing_quantity: 10,
                    unit_name: "g",
                },
            ]),
            makeRecipe(2, "B", [
                {
                    ingredient_name: "Sugar",
                    needed_quantity: 5,
                    missing_quantity: 5,
                    unit_name: "cups",
                },
            ]),
        ];

        const result = aggregateMenuIngredients(recipes);

        expect(result.Sugar.unit).toBe("g");
        expect(result.Sugar.quantity).toBe(15);
    });

    it("should always show the total needed quantity, even when sufficient", () => {
        const recipes = [
            makeRecipe(1, "Soup", [
                {
                    ingredient_name: "Onion",
                    needed_quantity: 3,
                    missing_quantity: 0,
                    unit_name: "pcs",
                },
            ]),
        ];

        const result = aggregateMenuIngredients(recipes);

        expect(result.Onion.quantity).toBe(3);
        expect(result.Onion.sufficient).toBe(true);
    });

    it("should mark an ingredient insufficient once any recipe still needs more", () => {
        const recipes = [
            makeRecipe(1, "Soup", [
                {
                    ingredient_name: "Onion",
                    needed_quantity: 2,
                    missing_quantity: 0,
                    unit_name: "pcs",
                },
            ]),
            makeRecipe(2, "Salad", [
                {
                    ingredient_name: "Onion",
                    needed_quantity: 2,
                    missing_quantity: 2,
                    unit_name: "pcs",
                },
            ]),
        ];

        expect(aggregateMenuIngredients(recipes).Onion.sufficient).toBe(false);
    });
});
