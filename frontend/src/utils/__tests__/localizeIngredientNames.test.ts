import i18next from "i18next";

import type { MenuDetails } from "types/menu";
import type { RecipeDetails } from "types/recipe";

import {
    localizeMenuIngredients,
    localizeRecipeIngredients,
} from "utils/localizeIngredientNames";

import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";

const t = i18next.getFixedT("en");

const RECIPE: RecipeDetails = {
    id: 7,
    title: "Borscht",
    language: "en",
    content: "Boil the beetroot.",
    ingredients: [
        {
            id: 3,
            slug: "chicken_breast",
            name: "stale name",
            category: "meat",
            quantity_recipe_ingredients: 1,
            unit_name: "kg",
            allergens: [],
            calories_per_unit: null,
        },
    ],
    type_id: 2,
    type_name: "Main course",
    cooking_time: 90,
    creation_date: "2024-01-01",
    isOwner: false,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: null,
    containsAvoided: null,
    tags: null,
    calories_per_portion: null,
    calories_override: null,
};

const MENU: MenuDetails = {
    menu: {
        id: 4,
        title: "Weekday menu",
        language: "en",
        categoryname: "Lunch",
        menucontent: "Quick and light.",
        category_id: 2,
        isOwner: false,
        photo_key: null,
        ...TEST_UNRATED,
        author: TEST_AUTHOR,
        isFavourite: null,
    },
    recipes: [
        {
            recipe_id: 9,
            title: "Borscht",
            language: "en",
            type_name: "Main course",
            cooking_time: 30,
            creation_date: "2024-01-01",
            calories_per_portion: null,
            photo_key: null,
            ratingAverage: null,
            ratingCount: 0,
            missingIngredients: [
                {
                    ingredient_id: 3,
                    ingredient_slug: "chicken_breast",
                    ingredient_name: "stale name",
                    needed_quantity: 1,
                    missing_quantity: 1,
                    unit_name: "kg",
                },
            ],
        },
    ],
    allergens: [],
};

describe("localizeRecipeIngredients", () => {
    it("should give every ingredient its name in the page's language", () => {
        expect(localizeRecipeIngredients(t, RECIPE).ingredients[0].name).toBe(
            "Chicken breast",
        );
    });
});

describe("localizeMenuIngredients", () => {
    it("should give every missing ingredient its name in the page's language", () => {
        const [recipe] = localizeMenuIngredients(t, MENU).recipes;

        expect(recipe.missingIngredients?.[0].ingredient_name).toBe(
            "Chicken breast",
        );
    });
});
