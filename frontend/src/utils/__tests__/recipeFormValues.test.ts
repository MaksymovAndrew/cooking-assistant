import type { RecipeDetails } from "types/recipe";

import {
    formValuesToCreateRequest,
    formValuesToUpdateRequest,
    recipeToFormValues,
} from "utils/recipeFormValues";

import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";

const RECIPE: RecipeDetails = {
    id: 1,
    title: "Borscht",
    language: "en",
    content: "boil",
    ingredients: [
        {
            id: 3,
            slug: "beet",
            name: "Beet",
            category: "vegetables",
            quantity_recipe_ingredients: 2,
            unit_name: "piece",
            allergens: [],
            calories_per_unit: 40,
        },
    ],
    type_id: 2,
    type_name: "Soup",
    cooking_time: 95,
    creation_date: "2024-01-01",
    isOwner: true,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: false,
    containsAvoided: false,
    tags: [],
    calories_per_portion: null,
    calories_override: null,
};

describe("recipeToFormValues", () => {
    it("should split the cooking time and carry each ingredient's quantity", () => {
        expect(recipeToFormValues(RECIPE)).toEqual({
            title: "Borscht",
            content: "boil",
            language: "en",
            cookingHours: "1",
            cookingMinutes: "35",
            selectedTypeId: 2,
            selectedIngredients: [
                {
                    id: 3,
                    slug: "beet",
                    name: "Beet",
                    quantity: 2,
                    unit_name: "piece",
                    calories_per_unit: 40,
                },
            ],
            caloriesOverride: "",
            photoKey: null,
        });
    });

    it("should hold a manual calorie value as text and a missing time as zero", () => {
        const values = recipeToFormValues({
            ...RECIPE,
            cooking_time: null,
            calories_override: 450,
        });

        expect(values.caloriesOverride).toBe("450");
        expect(values.cookingHours).toBe("0");
        expect(values.cookingMinutes).toBe("0");
    });
});

describe("form values to a request", () => {
    const values = {
        ...recipeToFormValues(RECIPE),
        cookingHours: "1",
        cookingMinutes: "05",
        caloriesOverride: "",
    };
    const sharedFields = {
        title: "Borscht",
        content: "boil",
        language: "en",
        type_id: 2,
        cooking_time: 65,
        calories_override: null,
    };

    it("should build a create request with the total minutes", () => {
        expect(formValuesToCreateRequest(values)).toEqual({
            ...sharedFields,
            ingredients: [{ id: 3, quantity: 2 }],
        });
    });

    it("should build an update request naming each amount after its column", () => {
        expect(formValuesToUpdateRequest(values)).toEqual({
            ...sharedFields,
            ingredients: [{ id: 3, quantity_recipe_ingredients: 2 }],
        });
    });

    it("should send a manual calorie value as a number", () => {
        expect(
            formValuesToCreateRequest({ ...values, caloriesOverride: "450" })
                .calories_override,
        ).toBe(450);
    });
});
