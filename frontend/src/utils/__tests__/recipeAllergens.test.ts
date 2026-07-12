import type { RecipeDetailIngredient } from "types/recipe";

import { getRecipeAllergens } from "utils/recipeAllergens";

const ingredient = (
    name: string,
    allergens: string | null,
): RecipeDetailIngredient => ({
    id: 1,
    name,
    quantity_recipe_ingredients: 1,
    unit_name: "pcs",
    allergens,
});

describe("getRecipeAllergens", () => {
    it("should return an empty list when no ingredient has an allergen", () => {
        expect(
            getRecipeAllergens([
                ingredient("Potato", "None"),
                ingredient("Water", null),
            ]),
        ).toEqual([]);
    });

    it("should return the unique allergens across all ingredients", () => {
        expect(
            getRecipeAllergens([
                ingredient("Flour", "Gluten"),
                ingredient("Pasta", "Gluten"),
                ingredient("Milk", "Dairy"),
                ingredient("Water", "None"),
            ]),
        ).toEqual(["Gluten", "Dairy"]);
    });
});
