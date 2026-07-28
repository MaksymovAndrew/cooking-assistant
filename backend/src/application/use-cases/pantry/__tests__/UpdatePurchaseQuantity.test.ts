import { ERROR_MESSAGES } from "constants/errorMessages";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import UpdatePurchaseQuantity from "application/use-cases/pantry/UpdatePurchaseQuantity";

import { catchError } from "test/helpers/assertions";

function setup() {
    const pantryRepository = { updatePurchaseQuantity: jest.fn() };
    const useCase = new UpdatePurchaseQuantity(pantryRepository);

    return { useCase, pantryRepository };
}

describe("UpdatePurchaseQuantity", () => {
    it("should throw a 400 ValidationError when quantity is undefined", async () => {
        const { useCase, pantryRepository } = setup();

        const error = await catchError(useCase.execute(7, 12, undefined));

        expect(error).toBeAppError(
            ValidationError,
            "Quantity cannot be empty.",
            400,
        );
        expect(pantryRepository.updatePurchaseQuantity).not.toHaveBeenCalled();
    });

    it("should throw a 404 NotFoundError when the purchase does not exist", async () => {
        const { useCase, pantryRepository } = setup();

        pantryRepository.updatePurchaseQuantity.mockResolvedValue(false);

        const error = await catchError(useCase.execute(7, 12, 3));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_MESSAGES.PURCHASE_NOT_FOUND,
            404,
        );
    });

    it("should throw a 400 ValidationError when quantity is not greater than 0", async () => {
        const { useCase, pantryRepository } = setup();

        const error = await catchError(useCase.execute(7, 12, 0));

        expect(error).toBeAppError(
            ValidationError,
            "Quantity must be greater than 0",
            400,
        );
        expect(pantryRepository.updatePurchaseQuantity).not.toHaveBeenCalled();
    });

    it("should update the purchase quantity when the purchase exists", async () => {
        const { useCase, pantryRepository } = setup();

        pantryRepository.updatePurchaseQuantity.mockResolvedValue(true);

        await useCase.execute(7, 12, 5);

        expect(pantryRepository.updatePurchaseQuantity).toHaveBeenCalledWith(
            7,
            12,
            5,
        );
    });
});
