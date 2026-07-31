import { ValidationError } from "domain/errors/AppError";

import AddUserIngredients from "application/use-cases/pantry/AddUserIngredients";

import { catchError } from "test/helpers/assertions";

function setup() {
    const pantryRepository = { addIngredients: jest.fn() };
    const ingredientRepository = { findExistingIds: jest.fn() };
    const useCase = new AddUserIngredients(
        pantryRepository,
        ingredientRepository,
    );

    return { useCase, pantryRepository, ingredientRepository };
}

describe("AddUserIngredients", () => {
    it("should throw a 400 ValidationError when ingredients are not an array", async () => {
        const { useCase, pantryRepository } = setup();

        const error = await catchError(
            useCase.execute(7, { id: 3, quantity: 2 }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "Incorrect data format",
            400,
        );
        expect(pantryRepository.addIngredients).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when a quantity is not greater than 0", async () => {
        const { useCase, pantryRepository } = setup();

        const error = await catchError(
            useCase.execute(7, [{ id: 3, quantity_person_ingradient: 0 }]),
        );

        expect(error).toBeAppError(
            ValidationError,
            "0.quantity_person_ingradient: Quantity must be greater than 0",
            400,
        );
        expect(pantryRepository.addIngredients).not.toHaveBeenCalled();
    });

    it("should add a fractional quantity", async () => {
        const { useCase, pantryRepository, ingredientRepository } = setup();
        const ingredients = [{ id: 3, quantity_person_ingradient: 1.5 }];

        ingredientRepository.findExistingIds.mockResolvedValue([3]);

        await useCase.execute(7, ingredients);

        expect(pantryRepository.addIngredients).toHaveBeenCalledWith(
            7,
            ingredients,
        );
    });

    it("should throw a 400 ValidationError when ingredient ids are duplicated", async () => {
        const { useCase, pantryRepository } = setup();

        const error = await catchError(
            useCase.execute(7, [
                { id: 3, quantity_person_ingradient: 2 },
                { id: 3, quantity_person_ingradient: 5 },
            ]),
        );

        expect(error).toBeAppError(
            ValidationError,
            "Ingredient IDs must be unique",
            400,
        );
        expect(pantryRepository.addIngredients).not.toHaveBeenCalled();
    });

    it("should add user ingredients when ingredients are an array", async () => {
        const { useCase, pantryRepository, ingredientRepository } = setup();
        const ingredients = [{ id: 3, quantity_person_ingradient: 2 }];

        ingredientRepository.findExistingIds.mockResolvedValue([3]);

        await useCase.execute(7, ingredients);

        expect(pantryRepository.addIngredients).toHaveBeenCalledWith(
            7,
            ingredients,
        );
    });

    it("should throw a 400 ValidationError when an ingredient id does not exist", async () => {
        const { useCase, pantryRepository, ingredientRepository } = setup();

        ingredientRepository.findExistingIds.mockResolvedValue([]);

        const error = await catchError(
            useCase.execute(7, [{ id: 999, quantity_person_ingradient: 2 }]),
        );

        expect(error).toBeAppError(
            ValidationError,
            "One or more ingredients do not exist",
            400,
        );
        expect(pantryRepository.addIngredients).not.toHaveBeenCalled();
    });
});
