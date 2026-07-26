import { ValidationError } from "domain/errors/AppError";

import UpdateIngredientQuantities from "application/use-cases/pantry/UpdateIngredientQuantities";

import { catchError } from "test/helpers/assertions";

function setup() {
    const pantryRepository = { updateQuantities: jest.fn() };
    const useCase = new UpdateIngredientQuantities(pantryRepository);

    return { useCase, pantryRepository };
}

describe("UpdateIngredientQuantities", () => {
    it("should throw a 400 ValidationError when updated ingredients are not an array", async () => {
        const { useCase, pantryRepository } = setup();

        const error = await catchError(
            useCase.execute(7, { id: 3, quantity: 2 }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "Incorrect data format",
            400,
        );
        expect(pantryRepository.updateQuantities).not.toHaveBeenCalled();
    });

    it("should update to a fractional quantity", async () => {
        const { useCase, pantryRepository } = setup();
        const items = [{ id: 3, quantity_person_ingradient: 1.5 }];

        await useCase.execute(7, items);

        expect(pantryRepository.updateQuantities).toHaveBeenCalledWith(
            7,
            items,
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
        expect(pantryRepository.updateQuantities).not.toHaveBeenCalled();
    });

    it("should update user ingredient quantities when items are an array", async () => {
        const { useCase, pantryRepository } = setup();
        const items = [{ id: 3, quantity_person_ingradient: 2 }];

        await useCase.execute(7, items);

        expect(pantryRepository.updateQuantities).toHaveBeenCalledWith(
            7,
            items,
        );
    });

    it("should accept quantity of 0 and pass it to the repository", async () => {
        const { useCase, pantryRepository } = setup();

        pantryRepository.updateQuantities.mockResolvedValue(undefined);

        await useCase.execute(7, [{ id: 3, quantity_person_ingradient: 0 }]);

        expect(pantryRepository.updateQuantities).toHaveBeenCalledWith(7, [
            { id: 3, quantity_person_ingradient: 0 },
        ]);
    });

    it("should throw a 400 ValidationError when a quantity is negative", async () => {
        const { useCase, pantryRepository } = setup();

        const error = await catchError(
            useCase.execute(7, [{ id: 3, quantity_person_ingradient: -1 }]),
        );

        expect(error).toBeAppError(
            ValidationError,
            "0.quantity_person_ingradient: Quantity must be 0 or more",
            400,
        );
        expect(pantryRepository.updateQuantities).not.toHaveBeenCalled();
    });
});
