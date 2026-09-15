import { ERROR_CODES } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";

import RemoveFavourite from "application/use-cases/favourites/RemoveFavourite";

import { catchError } from "test/helpers/assertions";

function setup() {
    const favouriteRepository = { remove: jest.fn() };
    const useCase = new RemoveFavourite(favouriteRepository, "menu");

    return { useCase, favouriteRepository };
}

describe("RemoveFavourite", () => {
    it("should remove the favourite for the user", async () => {
        const { useCase, favouriteRepository } = setup();

        favouriteRepository.remove.mockResolvedValue(undefined);

        await useCase.execute(7, "9");

        expect(favouriteRepository.remove).toHaveBeenCalledWith(7, "menu", 9);
    });

    it("should throw a 400 ValidationError for a non-positive id without touching the repository", async () => {
        const { useCase, favouriteRepository } = setup();

        const error = await catchError(useCase.execute(7, 0));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "ID must be positive",
        );
        expect(favouriteRepository.remove).not.toHaveBeenCalled();
    });
});
