import type { RecipeDetailIngredient } from "types/recipe";

import { getRecipeAllergens } from "utils/recipeAllergens";

const ingredient = (
    name: string,
    allergens: string[],
): RecipeDetailIngredient => ({
    id: 1,
    slug: name.toLowerCase(),
    name,
    category: "vegetables",
    quantity_recipe_ingredients: 1,
    unit_name: "piece",
    allergens,
});

describe("getRecipeAllergens", () => {
    it("should return an empty list when no ingredient has an allergen", () => {
        expect(
            getRecipeAllergens([
                ingredient("Potato", []),
                ingredient("Water", []),
            ]),
        ).toEqual([]);
    });

    it("should return the unique allergens across all ingredients", () => {
        expect(
            getRecipeAllergens([
                ingredient("Flour", ["gluten"]),
                ingredient("Pasta", ["gluten"]),
                ingredient("Milk", ["milk"]),
                ingredient("Water", []),
            ]),
        ).toEqual(["gluten", "milk"]);
    });
});
