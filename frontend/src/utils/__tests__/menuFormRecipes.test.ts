import type { MenuDetailRecipe } from "types/menu";
import type { RecipeSearchResultItem } from "types/recipe";

import { menuRecipeToListItem, toRecipeListItem } from "utils/menuFormRecipes";

import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";

const PICKED_FROM_SEARCH: RecipeSearchResultItem = {
    id: 4,
    title: "Borscht",
    language: "uk",
    type_name: "Soup",
    creation_date: "2026-01-01",
    cooking_time: 60,
    ingredients: [{ id: 7, name: "Beetroot", allergens: [] }],
    calories_per_portion: 320,
    isOwner: false,
    isFavourite: true,
    containsAvoided: false,
    tags: [],
    photo_key: null,
    author: TEST_AUTHOR,
    ...TEST_UNRATED,
};

const LOADED_WITH_MENU: MenuDetailRecipe = {
    recipe_id: 4,
    title: "Borscht",
    language: "uk",
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2026-01-01",
    calories_per_portion: 320,
    photo_key: null,
    ratingAverage: null,
    ratingCount: 0,
    missingIngredients: [],
};

describe("menuFormRecipes", () => {
    it("should make a recipe picked from search equal the same recipe loaded with the menu", () => {
        expect(toRecipeListItem(PICKED_FROM_SEARCH)).toEqual(
            menuRecipeToListItem(LOADED_WITH_MENU),
        );
    });
});
