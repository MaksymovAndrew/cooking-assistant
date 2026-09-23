import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import RateRecord from "application/use-cases/ratings/RateRecord";

import { catchError } from "test/helpers/assertions";

function setup(target: "recipe" | "menu" = "recipe") {
    const ratingRepository = { rate: jest.fn() };
    const useCase = new RateRecord(ratingRepository, target);

    return { useCase, ratingRepository };
}

describe("RateRecord", () => {
    it("should store the viewer's rating", async () => {
        const { useCase, ratingRepository } = setup();

        ratingRepository.rate.mockResolvedValue("rated");

        await useCase.execute(7, "5", { value: 4 });

        expect(ratingRepository.rate).toHaveBeenCalledWith(7, "recipe", 5, 4);
    });

    it("should throw a 404 NotFoundError when the recipe does not exist", async () => {
        const { useCase, ratingRepository } = setup("recipe");

        ratingRepository.rate.mockResolvedValue("not_found");

        const error = await catchError(useCase.execute(7, 5, { value: 4 }));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.RECIPE_NOT_FOUND,
            404,
        );
    });

    it("should throw a 404 NotFoundError when the menu does not exist", async () => {
        const { useCase, ratingRepository } = setup("menu");

        ratingRepository.rate.mockResolvedValue("not_found");

        const error = await catchError(useCase.execute(7, 5, { value: 4 }));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.MENU_NOT_FOUND,
            404,
        );
    });

    it("should throw a 400 ValidationError when the viewer rates their own record", async () => {
        const { useCase, ratingRepository } = setup();

        ratingRepository.rate.mockResolvedValue("own_record");

        const error = await catchError(useCase.execute(7, 5, { value: 5 }));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.RATING_OWN_RECORD,
            400,
        );
    });

    it.each([
        [0, "value: Rating must be at least 1"],
        [6, "value: Rating must be at most 5"],
        [3.5, "value: Rating must be an integer"],
        ["4", "value: Rating must be a number"],
    ])(
        "should throw a 400 ValidationError for a rating of %p without touching the repository",
        async (value, detail) => {
            const { useCase, ratingRepository } = setup();

            const error = await catchError(useCase.execute(7, 5, { value }));

            expect(error).toBeAppError(
                ValidationError,
                ERROR_CODES.VALIDATION_ERROR,
                400,
                detail,
            );
            expect(ratingRepository.rate).not.toHaveBeenCalled();
        },
    );
});
