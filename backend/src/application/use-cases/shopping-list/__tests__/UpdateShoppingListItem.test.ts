import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import UpdateShoppingListItem from "application/use-cases/shopping-list/UpdateShoppingListItem";

import { catchError } from "test/helpers/assertions";

function setup() {
    const shoppingListRepository = { updateItem: jest.fn() };
    const useCase = new UpdateShoppingListItem(shoppingListRepository);

    return { useCase, shoppingListRepository };
}

describe("UpdateShoppingListItem", () => {
    it("should reject a payload with no fields to update", async () => {
        const { useCase, shoppingListRepository } = setup();

        const error = await catchError(useCase.execute(7, 3, {}));

        expect(error).toBeInstanceOf(ValidationError);
        expect(shoppingListRepository.updateItem).not.toHaveBeenCalled();
    });

    it("should reject a non-boolean checked value", async () => {
        const { useCase } = setup();

        const error = await catchError(
            useCase.execute(7, 3, { checked: "yes" }),
        );

        expect(error).toBeInstanceOf(ValidationError);
    });

    it("should refuse a name change, since items keep the name they were added with", async () => {
        const { useCase, shoppingListRepository } = setup();

        const error = await catchError(
            useCase.execute(7, 3, { name: "Oat milk" }),
        );

        expect(error).toBeInstanceOf(ValidationError);
        expect(shoppingListRepository.updateItem).not.toHaveBeenCalled();
    });

    it("should pass only the provided fields, allowing the note to be cleared", async () => {
        const { useCase, shoppingListRepository } = setup();

        shoppingListRepository.updateItem.mockResolvedValue({ id: 3 });

        await useCase.execute(7, "3", { checked: true, note: null });

        expect(shoppingListRepository.updateItem).toHaveBeenCalledWith(7, 3, {
            checked: true,
            note: null,
        });
    });

    it("should throw a 404 NotFoundError when the item does not belong to the user", async () => {
        const { useCase, shoppingListRepository } = setup();

        shoppingListRepository.updateItem.mockResolvedValue(null);

        const error = await catchError(
            useCase.execute(7, 3, { checked: true }),
        );

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.SHOPPING_LIST_ITEM_NOT_FOUND,
            404,
        );
    });
});
