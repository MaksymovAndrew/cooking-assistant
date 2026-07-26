import { ERROR_MESSAGES } from "constants/errorMessages";
import Recipe from "domain/entities/Recipe";
import { ValidationError } from "domain/errors/AppError";

import CreateRecipe from "application/use-cases/recipes/CreateRecipe";

import { catchError } from "test/helpers/assertions";

function makeInput(overrides = {}) {
    return {
        title: "Tomato soup",
        content: "Boil tomatoes with stock",
        person_id: 7,
        ingredients: [{ id: 3, quantity: 2 }],
        type_id: 1,
        cooking_time: 30,
        servings: "4",
        ...overrides,
    };
}

function setup() {
    const recipeRepository = { create: jest.fn() };
    const ingredientRepository = { findExistingIds: jest.fn() };
    const useCase = new CreateRecipe(recipeRepository, ingredientRepository);

    return { useCase, recipeRepository, ingredientRepository };
}

describe("CreateRecipe", () => {
    it("should create a recipe entity and return the repository result", async () => {
        const { useCase, recipeRepository, ingredientRepository } = setup();
        const input = makeInput();
        const createdRecipe = { id: 12, ...input };

        ingredientRepository.findExistingIds.mockResolvedValue([3]);
        recipeRepository.create.mockResolvedValue(createdRecipe);

        const result = await useCase.execute(input);
        const [recipe] = recipeRepository.create.mock.calls[0] as [Recipe];

        expect(recipe).toBeInstanceOf(Recipe);
        expect(recipe).toMatchObject({
            title: input.title,
            content: input.content,
            person_id: input.person_id,
            ingredients: [{ id: 3, quantity_recipe_ingredients: 2 }],
            type_id: input.type_id,
            cooking_time: input.cooking_time,
            servings: input.servings,
        });
        expect(recipeRepository.create).toHaveBeenCalledWith(recipe);
        expect(result).toEqual(createdRecipe);
    });

    it("should accept free-form text servings, not just a plain number", async () => {
        const { useCase, recipeRepository, ingredientRepository } = setup();

        ingredientRepository.findExistingIds.mockResolvedValue([3]);

        await useCase.execute(makeInput({ servings: "a full pot" }));
        const [recipe] = recipeRepository.create.mock.calls[0] as [Recipe];

        expect(recipe).toMatchObject({ servings: "a full pot" });
    });

    it("should throw a 400 ValidationError when ingredient ids are duplicated", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(
            useCase.execute(
                makeInput({
                    ingredients: [
                        { id: 3, quantity: 2 },
                        { id: 3, quantity: 1 },
                    ],
                }),
            ),
        );

        expect(error).toBeAppError(
            ValidationError,
            "ingredients: Ingredient IDs must be unique",
            400,
        );
        expect(recipeRepository.create).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError and not create when input is invalid", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(
            useCase.execute(makeInput({ ingredients: [] })),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_MESSAGES.RECIPE_INGREDIENTS_EMPTY,
            400,
        );
        expect(recipeRepository.create).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when an ingredient does not exist", async () => {
        const { useCase, recipeRepository, ingredientRepository } = setup();

        ingredientRepository.findExistingIds.mockResolvedValue([]);

        const error = await catchError(useCase.execute(makeInput()));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_MESSAGES.RECIPE_INGREDIENTS_NOT_EXIST,
            400,
        );
        expect(recipeRepository.create).not.toHaveBeenCalled();
    });
});
