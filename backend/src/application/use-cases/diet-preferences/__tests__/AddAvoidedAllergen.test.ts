import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import AddAvoidedAllergen from "application/use-cases/diet-preferences/AddAvoidedAllergen";

import { catchError } from "test/helpers/assertions";

function setup() {
    const dietPreferencesRepository = { addAllergen: jest.fn() };
    const useCase = new AddAvoidedAllergen(dietPreferencesRepository);

    return { useCase, dietPreferencesRepository };
}

describe("AddAvoidedAllergen", () => {
    it("should add the allergen to the user's avoid list", async () => {
        const { useCase, dietPreferencesRepository } = setup();

        dietPreferencesRepository.addAllergen.mockResolvedValue(true);

        await useCase.execute(7, "gluten");

        expect(dietPreferencesRepository.addAllergen).toHaveBeenCalledWith(
            7,
            "gluten",
        );
    });

    it("should throw a 404 NotFoundError when the account no longer exists", async () => {
        const { useCase, dietPreferencesRepository } = setup();

        dietPreferencesRepository.addAllergen.mockResolvedValue(false);

        const error = await catchError(useCase.execute(7, "gluten"));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.USER_NOT_FOUND,
            404,
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
        expect(dietPreferencesRepository.addAllergen).not.toHaveBeenCalled();
    });
});
