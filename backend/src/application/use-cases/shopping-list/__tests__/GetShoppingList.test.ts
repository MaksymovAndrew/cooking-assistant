import { ValidationError } from "domain/errors/AppError";

import GetShoppingList from "application/use-cases/shopping-list/GetShoppingList";

import { catchError } from "test/helpers/assertions";

describe("GetShoppingList", () => {
    it("should return the user's items", async () => {
        const items = [{ id: 1, name: "Milk" }];
        const shoppingListRepository = {
            findByPerson: jest.fn().mockResolvedValue(items),
        };
        const useCase = new GetShoppingList(shoppingListRepository);

        const result = await useCase.execute("7");

        expect(result).toEqual(items);
        expect(shoppingListRepository.findByPerson).toHaveBeenCalledWith(7);
    });

    it("should reject an invalid user id", async () => {
        const useCase = new GetShoppingList({ findByPerson: jest.fn() });

        const error = await catchError(useCase.execute("abc"));

        expect(error).toBeInstanceOf(ValidationError);
    });
});
