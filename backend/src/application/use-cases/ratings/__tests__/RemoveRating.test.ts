import { ERROR_CODES } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";

import RemoveRating from "application/use-cases/ratings/RemoveRating";

import { catchError } from "test/helpers/assertions";

function setup() {
    const ratingRepository = { remove: jest.fn() };
    const useCase = new RemoveRating(ratingRepository, "menu");

    return { useCase, ratingRepository };
}

describe("RemoveRating", () => {
    it("should remove the viewer's rating", async () => {
        const { useCase, ratingRepository } = setup();

        ratingRepository.remove.mockResolvedValue(undefined);

        await useCase.execute(7, "9");

        expect(ratingRepository.remove).toHaveBeenCalledWith(7, "menu", 9);
    });

    it("should throw a 400 ValidationError for a non-positive id without touching the repository", async () => {
        const { useCase, ratingRepository } = setup();

        const error = await catchError(useCase.execute(7, 0));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "ID must be positive",
        );
        expect(ratingRepository.remove).not.toHaveBeenCalled();
    });
});
