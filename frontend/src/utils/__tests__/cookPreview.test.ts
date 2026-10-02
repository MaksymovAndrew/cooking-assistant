import type { MenuDetailRecipe, MissingIngredient } from "types/menu";
import type { CookRequirement } from "types/pantryConsumption";
import type { RecipeDetailIngredient } from "types/recipe";
import type { UserIngredient } from "types/userIngredient";

import {
    buildCookPreview,
    menuCookRequirements,
    recipeCookRequirements,
} from "utils/cookPreview";

const FLOUR: CookRequirement = {
    ingredient_id: 10,
    slug: "flour",
    name: "Flour",
    unit_name: "g",
    quantity: 200,
};

const pantryItem = (ingredientId: number, lots: number[]): UserIngredient => ({
    ingredient_id: ingredientId,
    ingredient_slug: "flour",
    ingredient_name: "Flour",
    category: "baking",
    unit_name: "g",
    quantity_person_ingradient: lots.reduce((sum, lot) => sum + lot, 0),
    allergens: [],
    lots: lots.map((quantity, index) => ({
        id: index + 1,
        quantity,
        purchase_date: "2026-01-01T00:00:00.000Z",
    })),
});

const missing = (
    ingredientId: number,
    neededQuantity: number,
): MissingIngredient => ({
    ingredient_id: ingredientId,
    ingredient_slug: `slug-${ingredientId}`,
    ingredient_name: `Ingredient ${ingredientId}`,
    needed_quantity: neededQuantity,
    missing_quantity: 0,
    unit_name: "g",
});

const menuRecipe = (
    recipeId: number,
    ingredients: MissingIngredient[],
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
    missingIngredients: ingredients,
});

describe("recipeCookRequirements", () => {
    it("should take each ingredient's own quantity for one portion", () => {
        const ingredient: RecipeDetailIngredient = {
            id: 10,
            slug: "flour",
            name: "Flour",
            category: "baking",
            quantity_recipe_ingredients: 200,
            unit_name: "g",
            allergens: [],
            calories_per_unit: null,
        };

        expect(recipeCookRequirements([ingredient])).toEqual([FLOUR]);
    });
});

describe("menuCookRequirements", () => {
    it("should sum an ingredient across recipes and count a repeated recipe once", () => {
        const pancakes = menuRecipe(1, [missing(10, 200), missing(20, 2)]);
        const bread = menuRecipe(2, [missing(10, 500)]);

        expect(
            menuCookRequirements([pancakes, pancakes, bread]).map(
                ({ ingredient_id, quantity }) => [ingredient_id, quantity],
            ),
        ).toEqual([
            [10, 700],
            [20, 2],
        ]);
    });
});

describe("buildCookPreview", () => {
    it("should scale the need by the portions and mark covered ingredients full", () => {
        const [line] = buildCookPreview(
            [FLOUR],
            [pantryItem(10, [300, 300])],
            2,
        );

        expect(line).toEqual(
            expect.objectContaining({
                needed: 400,
                available: 600,
                status: "full",
            }),
        );
    });

    it("should mark an ingredient partial when the lots cover only some of it", () => {
        const [line] = buildCookPreview([FLOUR], [pantryItem(10, [150])], 1);

        expect(line.status).toBe("partial");
        expect(line.available).toBe(150);
    });

    it("should mark an ingredient missing when the pantry has none of it", () => {
        const [line] = buildCookPreview([FLOUR], [], 1);

        expect(line.status).toBe("missing");
    });

    it("should count only the lots, which is what cooking takes from", () => {
        const item = { ...pantryItem(10, []), quantity_person_ingradient: 500 };
        const [line] = buildCookPreview([FLOUR], [item], 1);

        expect(line.status).toBe("missing");
    });

    it("should treat lots that add up exactly as enough despite float noise", () => {
        const tiny = { ...FLOUR, quantity: 0.3 };
        const [line] = buildCookPreview(
            [tiny],
            [pantryItem(10, [0.1, 0.2])],
            1,
        );

        expect(line.status).toBe("full");
    });
});
