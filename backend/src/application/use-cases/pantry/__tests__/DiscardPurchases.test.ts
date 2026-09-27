import { ERROR_CODES } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";

import DiscardPurchases from "application/use-cases/pantry/DiscardPurchases";

import { catchError } from "test/helpers/assertions";

function setup() {
    const pantryRepository = { deletePurchases: jest.fn() };
    const useCase = new DiscardPurchases(pantryRepository);

    return { useCase, pantryRepository };
}

describe("DiscardPurchases", () => {
    it("should delete every given purchase and report how many went", async () => {
        const { useCase, pantryRepository } = setup();

        pantryRepository.deletePurchases.mockResolvedValue(2);

        const discarded = await useCase.execute(7, [12, 13]);

        expect(discarded).toBe(2);
        expect(pantryRepository.deletePurchases).toHaveBeenCalledWith(
            7,
            [12, 13],
        );
    });

    it("should throw a 400 ValidationError for an empty list", async () => {
        const { useCase, pantryRepository } = setup();

        const error = await catchError(useCase.execute(7, []));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "Purchase IDs are required",
        );
        expect(pantryRepository.deletePurchases).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError for repeated ids", async () => {
        const { useCase, pantryRepository } = setup();

        const error = await catchError(useCase.execute(7, [12, 12]));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "Purchase IDs must be unique",
        );
        expect(pantryRepository.deletePurchases).not.toHaveBeenCalled();
    });
});
