import { ERROR_CODES } from "constants/errorCodes";
import { ConflictError, ValidationError } from "domain/errors/AppError";

import ReorderShoppingList from "application/use-cases/shopping-list/ReorderShoppingList";

import { catchError } from "test/helpers/assertions";

function setup() {
    const shoppingListRepository = { reorder: jest.fn() };
    const useCase = new ReorderShoppingList(shoppingListRepository);

    return { useCase, shoppingListRepository };
}

describe("ReorderShoppingList", () => {
    it("should reject duplicate ids", async () => {
        const { useCase, shoppingListRepository } = setup();

        const error = await catchError(useCase.execute(7, { ids: [1, 1] }));

        expect(error).toBeInstanceOf(ValidationError);
        expect(shoppingListRepository.reorder).not.toHaveBeenCalled();
    });

    it("should pass the ids in the requested order", async () => {
        const { useCase, shoppingListRepository } = setup();

        shoppingListRepository.reorder.mockResolvedValue(true);

        await useCase.execute(7, { ids: [3, 1, 2] });

        expect(shoppingListRepository.reorder).toHaveBeenCalledWith(
            7,
            [3, 1, 2],
        );
    });

    it("should throw a 409 ConflictError when the ids no longer match the list", async () => {
        const { useCase, shoppingListRepository } = setup();

        shoppingListRepository.reorder.mockResolvedValue(false);

        const error = await catchError(useCase.execute(7, { ids: [1, 2] }));

        expect(error).toBeAppError(
            ConflictError,
            ERROR_CODES.SHOPPING_LIST_ORDER_OUT_OF_DATE,
            409,
        );
    });
});
