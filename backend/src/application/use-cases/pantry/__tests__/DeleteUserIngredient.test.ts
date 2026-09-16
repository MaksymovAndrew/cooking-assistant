import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";

import DeleteUserIngredient from "application/use-cases/pantry/DeleteUserIngredient";

import { catchError } from "test/helpers/assertions";

function setup() {
    const pantryRepository = { deleteIngredient: jest.fn() };
    const useCase = new DeleteUserIngredient(pantryRepository);

    return { useCase, pantryRepository };
}

describe("DeleteUserIngredient", () => {
    it("should throw a 404 NotFoundError when the ingredient does not exist for the user", async () => {
        const { useCase, pantryRepository } = setup();

        pantryRepository.deleteIngredient.mockResolvedValue(false);

        const error = await catchError(useCase.execute(7, 3));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.INGREDIENT_NOT_FOUND_FOR_USER,
            404,
        );
    });

    it("should delete the ingredient for the user when it exists", async () => {
        const { useCase, pantryRepository } = setup();

        pantryRepository.deleteIngredient.mockResolvedValue(true);

        await useCase.execute(7, 3);

        expect(pantryRepository.deleteIngredient).toHaveBeenCalledWith(7, 3);
    });
});
