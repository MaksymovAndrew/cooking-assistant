import { ERROR_MESSAGES } from "constants/errorMessages";
import Recipe from "domain/entities/Recipe";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import UpdateRecipe from "application/use-cases/recipes/UpdateRecipe";

import { catchError } from "test/helpers/assertions";

function makeInput(overrides = {}) {
    return {
        title: "Tomato soup",
        content: "Boil tomatoes with stock",
        ingredients: [{ id: 3, quantity: 2 }],
        type_id: 1,
        cooking_time: 30,
        ...overrides,
    };
}

function setup() {
    const recipeRepository = { update: jest.fn() };
    const ingredientRepository = { findExistingIds: jest.fn() };
    const useCase = new UpdateRecipe(recipeRepository, ingredientRepository);

    return { useCase, recipeRepository, ingredientRepository };
}

describe("UpdateRecipe", () => {
    it("should update a recipe entity and return the repository result", async () => {
        const { useCase, recipeRepository, ingredientRepository } = setup();
        const input = makeInput();
        const updatedRecipe = { id: 12, ...input };

        ingredientRepository.findExistingIds.mockResolvedValue([3]);
        recipeRepository.update.mockResolvedValue(updatedRecipe);

        const result = await useCase.execute(12, 7, input);
        const [id, personId, recipe] = recipeRepository.update.mock
            .calls[0] as [number, number, Recipe];

        expect(id).toBe(12);
        expect(personId).toBe(7);
        expect(recipe).toBeInstanceOf(Recipe);
        expect(recipe).toMatchObject({
            title: input.title,
            content: input.content,
            ingredients: [{ id: 3, quantity_recipe_ingredients: 2 }],
            type_id: input.type_id,
            cooking_time: input.cooking_time,
        });
        expect(result).toEqual(updatedRecipe);
    });

    it("should accept a manual calorie override", async () => {
        const { useCase, recipeRepository, ingredientRepository } = setup();

        ingredientRepository.findExistingIds.mockResolvedValue([3]);
        recipeRepository.update.mockResolvedValue({ id: 12 });

        await useCase.execute(12, 7, makeInput({ calories_override: 500 }));
        const [, , recipe] = recipeRepository.update.mock.calls[0] as [
            number,
            number,
            Recipe,
        ];

        expect(recipe).toMatchObject({ calories_override: 500 });
    });

    it("should throw a 404 NotFoundError when the recipe does not belong to the user", async () => {
        const { useCase, recipeRepository, ingredientRepository } = setup();

        ingredientRepository.findExistingIds.mockResolvedValue([3]);
        recipeRepository.update.mockResolvedValue(null);

        const error = await catchError(useCase.execute(12, 7, makeInput()));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_MESSAGES.RECIPE_NOT_FOUND,
            404,
        );
    });

    it("should throw a 400 ValidationError before updating when input is invalid", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(
            useCase.execute(12, 7, makeInput({ title: "" })),
        );

        expect(error).toBeAppError(
            ValidationError,
            "title: Title cannot be empty",
            400,
        );
        expect(recipeRepository.update).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when an ingredient does not exist", async () => {
        const { useCase, recipeRepository, ingredientRepository } = setup();

        ingredientRepository.findExistingIds.mockResolvedValue([]);

        const error = await catchError(useCase.execute(12, 7, makeInput()));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_MESSAGES.RECIPE_INGREDIENTS_NOT_EXIST,
            400,
        );
        expect(recipeRepository.update).not.toHaveBeenCalled();
    });
});
