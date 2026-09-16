import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import AddFavourite from "application/use-cases/favourites/AddFavourite";

import { catchError } from "test/helpers/assertions";

function setup(target: "recipe" | "menu" = "recipe") {
    const favouriteRepository = { add: jest.fn() };
    const useCase = new AddFavourite(favouriteRepository, target);

    return { useCase, favouriteRepository };
}

describe("AddFavourite", () => {
    it("should add the favourite for the user", async () => {
        const { useCase, favouriteRepository } = setup();

        favouriteRepository.add.mockResolvedValue(true);

        await useCase.execute(7, "5");

        expect(favouriteRepository.add).toHaveBeenCalledWith(7, "recipe", 5);
    });

    it("should throw a 404 NotFoundError when the recipe does not exist", async () => {
        const { useCase, favouriteRepository } = setup("recipe");

        favouriteRepository.add.mockResolvedValue(false);

        const error = await catchError(useCase.execute(7, 5));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.RECIPE_NOT_FOUND,
            404,
        );
    });

    it("should throw a 404 NotFoundError when the menu does not exist", async () => {
        const { useCase, favouriteRepository } = setup("menu");

        favouriteRepository.add.mockResolvedValue(false);

        const error = await catchError(useCase.execute(7, 5));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.MENU_NOT_FOUND,
            404,
        );
    });

    it("should throw a 400 ValidationError for a non-numeric id without touching the repository", async () => {
        const { useCase, favouriteRepository } = setup();

        const error = await catchError(useCase.execute(7, "abc"));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "ID must be a number",
        );
        expect(favouriteRepository.add).not.toHaveBeenCalled();
    });
});
