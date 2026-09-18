import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";

import DeleteShoppingListItem from "application/use-cases/shopping-list/DeleteShoppingListItem";

import { catchError } from "test/helpers/assertions";

function setup() {
    const shoppingListRepository = { deleteItem: jest.fn() };
    const useCase = new DeleteShoppingListItem(shoppingListRepository);

    return { useCase, shoppingListRepository };
}

describe("DeleteShoppingListItem", () => {
    it("should throw a 404 NotFoundError when the item does not exist for the user", async () => {
        const { useCase, shoppingListRepository } = setup();

        shoppingListRepository.deleteItem.mockResolvedValue(false);

        const error = await catchError(useCase.execute(7, 3));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.SHOPPING_LIST_ITEM_NOT_FOUND,
            404,
        );
    });

    it("should delete the item for the user when it exists", async () => {
        const { useCase, shoppingListRepository } = setup();

        shoppingListRepository.deleteItem.mockResolvedValue(true);

        await useCase.execute(7, "3");

        expect(shoppingListRepository.deleteItem).toHaveBeenCalledWith(7, 3);
    });
});
