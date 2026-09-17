import { ERROR_CODES } from "constants/errorCodes";
import { SHOPPING_LIST_LIMITS } from "constants/shoppingList";
import {
    ConflictError,
    NotFoundError,
    ValidationError,
} from "domain/errors/AppError";

import AddIngredientsToShoppingList from "application/use-cases/shopping-list/AddIngredientsToShoppingList";

import { catchError } from "test/helpers/assertions";

function setup() {
    const shoppingListRepository = { addIngredients: jest.fn() };
    const ingredientRepository = { findExistingIds: jest.fn() };
    const useCase = new AddIngredientsToShoppingList(
        shoppingListRepository,
        ingredientRepository,
    );

    return { useCase, shoppingListRepository, ingredientRepository };
}

describe("AddIngredientsToShoppingList", () => {
    it("should reject an empty item list", async () => {
        const { useCase } = setup();

        const error = await catchError(useCase.execute(7, { items: [] }));

        expect(error).toBeInstanceOf(ValidationError);
    });

    it("should reject the same ingredient listed twice", async () => {
        const { useCase } = setup();

        const error = await catchError(
            useCase.execute(7, {
                items: [
                    { ingredient_id: 4, quantity: 1 },
                    { ingredient_id: 4, quantity: 2 },
                ],
            }),
        );

        expect(error).toBeInstanceOf(ValidationError);
    });

    it("should throw a ValidationError when an ingredient does not exist", async () => {
        const { useCase, shoppingListRepository, ingredientRepository } =
            setup();

        ingredientRepository.findExistingIds.mockResolvedValue([]);

        const error = await catchError(
            useCase.execute(7, { items: [{ ingredient_id: 4, quantity: 1 }] }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.RECIPE_INGREDIENTS_NOT_EXIST,
            400,
        );
        expect(shoppingListRepository.addIngredients).not.toHaveBeenCalled();
    });

    it("should add the ingredients with the list size limit", async () => {
        const { useCase, shoppingListRepository, ingredientRepository } =
            setup();
        const items = [{ ingredient_id: 4, quantity: 250 }];

        ingredientRepository.findExistingIds.mockResolvedValue([4]);
        shoppingListRepository.addIngredients.mockResolvedValue("added");

        await useCase.execute(7, { items });

        expect(shoppingListRepository.addIngredients).toHaveBeenCalledWith(
            7,
            items,
            SHOPPING_LIST_LIMITS.MAX_ITEMS,
        );
    });

    it("should add an ingredient without a quantity", async () => {
        const { useCase, shoppingListRepository, ingredientRepository } =
            setup();
        const items = [{ ingredient_id: 4, quantity: null }];

        ingredientRepository.findExistingIds.mockResolvedValue([4]);
        shoppingListRepository.addIngredients.mockResolvedValue("added");

        await useCase.execute(7, { items });

        expect(shoppingListRepository.addIngredients).toHaveBeenCalledWith(
            7,
            items,
            SHOPPING_LIST_LIMITS.MAX_ITEMS,
        );
    });

    it("should throw a 409 ConflictError when the new items would not fit", async () => {
        const { useCase, shoppingListRepository, ingredientRepository } =
            setup();

        ingredientRepository.findExistingIds.mockResolvedValue([4]);
        shoppingListRepository.addIngredients.mockResolvedValue(
            "limit_reached",
        );

        const error = await catchError(
            useCase.execute(7, { items: [{ ingredient_id: 4, quantity: 1 }] }),
        );

        expect(error).toBeAppError(
            ConflictError,
            ERROR_CODES.SHOPPING_LIST_LIMIT_REACHED,
            409,
        );
    });

    it("should throw a 404 NotFoundError when the account no longer exists", async () => {
        const { useCase, shoppingListRepository, ingredientRepository } =
            setup();

        ingredientRepository.findExistingIds.mockResolvedValue([4]);
        shoppingListRepository.addIngredients.mockResolvedValue(
            "person_not_found",
        );

        const error = await catchError(
            useCase.execute(7, { items: [{ ingredient_id: 4, quantity: 1 }] }),
        );

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.USER_NOT_FOUND,
            404,
        );
    });
});
