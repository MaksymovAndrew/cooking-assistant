import { ERROR_CODES } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";

import RemoveAvoidedAllergen from "application/use-cases/diet-preferences/RemoveAvoidedAllergen";

import { catchError } from "test/helpers/assertions";

function setup() {
    const dietPreferencesRepository = { removeAllergen: jest.fn() };
    const useCase = new RemoveAvoidedAllergen(dietPreferencesRepository);

    return { useCase, dietPreferencesRepository };
}

describe("RemoveAvoidedAllergen", () => {
    it("should remove the allergen from the user's avoid list", async () => {
        const { useCase, dietPreferencesRepository } = setup();

        await useCase.execute(7, "milk");

        expect(dietPreferencesRepository.removeAllergen).toHaveBeenCalledWith(
            7,
            "milk",
        );
    });

    it("should throw a 400 ValidationError for an unknown allergen without touching the repository", async () => {
        const { useCase, dietPreferencesRepository } = setup();

        const error = await catchError(useCase.execute(7, "chocolate"));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "Unknown allergen",
        );
        expect(dietPreferencesRepository.removeAllergen).not.toHaveBeenCalled();
    });
});
