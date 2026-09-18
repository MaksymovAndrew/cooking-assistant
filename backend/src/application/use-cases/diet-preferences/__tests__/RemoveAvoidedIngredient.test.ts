import { ERROR_CODES } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";

import RemoveAvoidedIngredient from "application/use-cases/diet-preferences/RemoveAvoidedIngredient";

import { catchError } from "test/helpers/assertions";

function setup() {
    const dietPreferencesRepository = { removeIngredient: jest.fn() };
    const useCase = new RemoveAvoidedIngredient(dietPreferencesRepository);

    return { useCase, dietPreferencesRepository };
}

describe("RemoveAvoidedIngredient", () => {
    it("should remove the ingredient from the user's avoid list", async () => {
        const { useCase, dietPreferencesRepository } = setup();

        await useCase.execute(7, "5");

        expect(dietPreferencesRepository.removeIngredient).toHaveBeenCalledWith(
            7,
            5,
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
        expect(
            dietPreferencesRepository.removeIngredient,
        ).not.toHaveBeenCalled();
    });
});
