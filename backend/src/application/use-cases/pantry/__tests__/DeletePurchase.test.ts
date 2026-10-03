import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";

import DeletePurchase from "application/use-cases/pantry/DeletePurchase";

import { catchError } from "test/helpers/assertions";

function setup() {
    const pantryRepository = { deletePurchases: jest.fn() };
    const useCase = new DeletePurchase(pantryRepository);

    return { useCase, pantryRepository };
}

describe("DeletePurchase", () => {
    it("should delete the purchase when it belongs to the user", async () => {
        const { useCase, pantryRepository } = setup();

        pantryRepository.deletePurchases.mockResolvedValue(1);

        await useCase.execute(7, 12);

        expect(pantryRepository.deletePurchases).toHaveBeenCalledWith(7, [12]);
    });

    it("should throw a 404 NotFoundError when the purchase does not exist", async () => {
        const { useCase, pantryRepository } = setup();

        pantryRepository.deletePurchases.mockResolvedValue(0);

        const error = await catchError(useCase.execute(7, 12));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.PURCHASE_NOT_FOUND,
            404,
        );
    });
});
