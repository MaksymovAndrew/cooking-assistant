import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";

import PhotoCleanup from "application/media/PhotoCleanup";
import DeleteRecipe from "application/use-cases/recipes/DeleteRecipe";

import { catchError } from "test/helpers/assertions";

function setup() {
    const recipeRepository = { deleteById: jest.fn() };
    const photoRepository = { findKey: jest.fn(), listOwnedKeys: jest.fn() };
    const mediaStorage = { remove: jest.fn() };
    const useCase = new DeleteRecipe(
        recipeRepository,
        new PhotoCleanup(photoRepository, mediaStorage),
    );

    return { useCase, recipeRepository, photoRepository, mediaStorage };
}

describe("DeleteRecipe", () => {
    it("should throw a 404 NotFoundError when the recipe does not belong to the user", async () => {
        const { useCase, recipeRepository } = setup();

        recipeRepository.deleteById.mockResolvedValue(false);

        const error = await catchError(useCase.execute(12, 7));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.RECIPE_NOT_FOUND,
            404,
        );
    });

    it("should delete the recipe when it belongs to the user", async () => {
        const { useCase, recipeRepository } = setup();

        recipeRepository.deleteById.mockResolvedValue(true);

        await useCase.execute(12, 7);

        expect(recipeRepository.deleteById).toHaveBeenCalledWith(12, 7);
    });

    it("should remove the recipe's photo once the recipe is deleted", async () => {
        const { useCase, recipeRepository, photoRepository, mediaStorage } =
            setup();

        photoRepository.findKey.mockResolvedValue("photo-key");
        recipeRepository.deleteById.mockResolvedValue(true);

        await useCase.execute(12, 7);

        expect(photoRepository.findKey).toHaveBeenCalledWith(7, "recipe", 12);
        expect(mediaStorage.remove).toHaveBeenCalledWith("photo-key");
    });

    it("should keep the photo when the recipe could not be deleted", async () => {
        const { useCase, recipeRepository, photoRepository, mediaStorage } =
            setup();

        photoRepository.findKey.mockResolvedValue("photo-key");
        recipeRepository.deleteById.mockResolvedValue(false);

        await catchError(useCase.execute(12, 7));

        expect(mediaStorage.remove).not.toHaveBeenCalled();
    });
});
