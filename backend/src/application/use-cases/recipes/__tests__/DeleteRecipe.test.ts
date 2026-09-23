import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";

import PhotoCleanup from "application/media/PhotoCleanup";
import DeleteRecipe from "application/use-cases/recipes/DeleteRecipe";

import { catchError } from "test/helpers/assertions";

function setup() {
    const recipeRepository = { deleteById: jest.fn() };
    const mediaStorage = { remove: jest.fn() };
    const useCase = new DeleteRecipe(
        recipeRepository,
        new PhotoCleanup(mediaStorage),
    );

    return { useCase, recipeRepository, mediaStorage };
}

describe("DeleteRecipe", () => {
    it("should throw a 404 NotFoundError when the recipe does not belong to the user", async () => {
        const { useCase, recipeRepository } = setup();

        recipeRepository.deleteById.mockResolvedValue(null);

        const error = await catchError(useCase.execute(12, 7));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.RECIPE_NOT_FOUND,
            404,
        );
    });

    it("should delete the recipe when it belongs to the user", async () => {
        const { useCase, recipeRepository } = setup();

        recipeRepository.deleteById.mockResolvedValue({ photoKey: null });

        await useCase.execute(12, 7);

        expect(recipeRepository.deleteById).toHaveBeenCalledWith(12, 7);
    });

    it("should remove the recipe's photo once the recipe is deleted", async () => {
        const { useCase, recipeRepository, mediaStorage } = setup();

        recipeRepository.deleteById.mockResolvedValue({
            photoKey: "photo-key",
        });

        await useCase.execute(12, 7);

        expect(mediaStorage.remove).toHaveBeenCalledWith("photo-key");
    });

    it("should not touch storage when the recipe could not be deleted", async () => {
        const { useCase, recipeRepository, mediaStorage } = setup();

        recipeRepository.deleteById.mockResolvedValue(null);

        await catchError(useCase.execute(12, 7));

        expect(mediaStorage.remove).not.toHaveBeenCalled();
    });
});
