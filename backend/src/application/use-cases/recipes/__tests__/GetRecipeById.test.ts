import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";

import GetRecipeById from "application/use-cases/recipes/GetRecipeById";

import { catchError } from "test/helpers/assertions";

function setup() {
    const recipeRepository = { findByIdWithIngredients: jest.fn() };
    const useCase = new GetRecipeById(recipeRepository);

    return { useCase, recipeRepository };
}

describe("GetRecipeById", () => {
    it("should throw a 404 NotFoundError when the recipe does not exist", async () => {
        const { useCase, recipeRepository } = setup();

        recipeRepository.findByIdWithIngredients.mockResolvedValue(null);

        const error = await catchError(useCase.execute(12, 7));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.RECIPE_NOT_FOUND,
            404,
        );
    });

    it("should return the recipe and pass the requesting user to the repository", async () => {
        const { useCase, recipeRepository } = setup();
        const recipe = { id: 12, title: "Tomato soup", isOwner: true };

        recipeRepository.findByIdWithIngredients.mockResolvedValue(recipe);

        const result = await useCase.execute(12, 7);

        expect(recipeRepository.findByIdWithIngredients).toHaveBeenCalledWith(
            12,
            7,
        );
        expect(result).toEqual(recipe);
    });
});
