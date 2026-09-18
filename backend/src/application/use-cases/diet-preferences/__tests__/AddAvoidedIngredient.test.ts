import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import AddAvoidedIngredient from "application/use-cases/diet-preferences/AddAvoidedIngredient";

import { catchError } from "test/helpers/assertions";

function setup() {
    const dietPreferencesRepository = { addIngredient: jest.fn() };
    const useCase = new AddAvoidedIngredient(dietPreferencesRepository);

    return { useCase, dietPreferencesRepository };
}

describe("AddAvoidedIngredient", () => {
    it("should add the ingredient to the user's avoid list", async () => {
        const { useCase, dietPreferencesRepository } = setup();

        dietPreferencesRepository.addIngredient.mockResolvedValue("added");

        await useCase.execute(7, "5");

        expect(dietPreferencesRepository.addIngredient).toHaveBeenCalledWith(
            7,
            5,
        );
    });

    it("should throw a 404 NotFoundError when the ingredient does not exist", async () => {
        const { useCase, dietPreferencesRepository } = setup();

        dietPreferencesRepository.addIngredient.mockResolvedValue(
            "ingredient_not_found",
        );

        const error = await catchError(useCase.execute(7, 999));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.INGREDIENT_NOT_FOUND,
            404,
        );
    });

    it("should throw a 404 NotFoundError when the account no longer exists", async () => {
        const { useCase, dietPreferencesRepository } = setup();

        dietPreferencesRepository.addIngredient.mockResolvedValue(
            "person_not_found",
        );

        const error = await catchError(useCase.execute(7, 5));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.USER_NOT_FOUND,
            404,
        );
    });

    it("should throw a 400 ValidationError for a non-numeric id without touching the repository", async () => {
        const { useCase, dietPreferencesRepository } = setup();

        const error = await catchError(useCase.execute(7, "abc"));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "ID must be a number",
        );
        expect(dietPreferencesRepository.addIngredient).not.toHaveBeenCalled();
    });
});
