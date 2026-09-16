import { ERROR_CODES } from "constants/errorCodes";
import { SHOPPING_LIST_LIMITS } from "constants/shoppingList";
import { ConflictError, ValidationError } from "domain/errors/AppError";

import AddShoppingListItem from "application/use-cases/shopping-list/AddShoppingListItem";

import { catchError } from "test/helpers/assertions";

function setup() {
    const shoppingListRepository = { addItem: jest.fn() };
    const useCase = new AddShoppingListItem(shoppingListRepository);

    return { useCase, shoppingListRepository };
}

describe("AddShoppingListItem", () => {
    it("should reject a blank name", async () => {
        const { useCase, shoppingListRepository } = setup();

        const error = await catchError(useCase.execute(7, { name: "   " }));

        expect(error).toBeInstanceOf(ValidationError);
        expect(shoppingListRepository.addItem).not.toHaveBeenCalled();
    });

    it("should reject a name longer than the limit", async () => {
        const { useCase } = setup();

        const error = await catchError(
            useCase.execute(7, {
                name: "a".repeat(SHOPPING_LIST_LIMITS.MAX_NAME_LENGTH + 1),
            }),
        );

        expect(error).toBeInstanceOf(ValidationError);
    });

    it("should trim the name and store a blank note as null", async () => {
        const { useCase, shoppingListRepository } = setup();

        shoppingListRepository.addItem.mockResolvedValue({ id: 1 });

        await useCase.execute(7, { name: "  Milk ", note: "  " });

        expect(shoppingListRepository.addItem).toHaveBeenCalledWith(
            7,
            { name: "Milk", note: null },
            SHOPPING_LIST_LIMITS.MAX_ITEMS,
        );
    });

    it("should throw a 409 ConflictError when the list is full", async () => {
        const { useCase, shoppingListRepository } = setup();

        shoppingListRepository.addItem.mockResolvedValue(null);

        const error = await catchError(useCase.execute(7, { name: "Milk" }));

        expect(error).toBeAppError(
            ConflictError,
            ERROR_CODES.SHOPPING_LIST_LIMIT_REACHED,
            409,
        );
    });
});
