import { ERROR_CODES } from "constants/errorCodes";
import Recipe, { type RecipeCreationData } from "domain/entities/Recipe";
import { ValidationError } from "domain/errors/AppError";

import { catchSyncError } from "test/helpers/assertions";

function makeCreationInput(
    overrides: Partial<RecipeCreationData> = {},
): RecipeCreationData {
    return {
        title: "Tomato soup",
        content: "Boil tomatoes with stock",
        language: "uk",
        person_id: 7,
        ingredients: [{ id: 3, quantity_recipe_ingredients: 2 }],
        type_id: 1,
        cooking_time: 30,
        calories_override: 500,
        ...overrides,
    };
}

describe("Recipe", () => {
    it("should throw a 400 ValidationError when creation ingredients are empty", () => {
        const error = catchSyncError(() => {
            Recipe.forCreation(makeCreationInput({ ingredients: [] }));
        });

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.RECIPE_INGREDIENTS_EMPTY,
            400,
        );
    });

    it("should create a recipe with all creation fields", () => {
        const input = makeCreationInput();

        const recipe = Recipe.forCreation(input);

        expect(recipe).toBeInstanceOf(Recipe);
        expect(recipe).toEqual(input);
    });

    it("should throw a 400 ValidationError when update ingredients are empty", () => {
        const error = catchSyncError(() => {
            Recipe.forUpdate(makeCreationInput({ ingredients: [] }));
        });

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.RECIPE_INGREDIENTS_EMPTY,
            400,
        );
    });

    it("should create an update recipe without person_id", () => {
        const input = makeCreationInput();

        const recipe = Recipe.forUpdate(input);

        expect(recipe).toBeInstanceOf(Recipe);
        expect(recipe).toEqual({
            title: input.title,
            content: input.content,
            language: "uk",
            ingredients: input.ingredients,
            type_id: input.type_id,
            cooking_time: input.cooking_time,
            calories_override: input.calories_override,
        });
        expect(recipe).not.toHaveProperty("person_id");
    });
});
