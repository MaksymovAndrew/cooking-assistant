import { ERROR_CODES } from "constants/errorCodes";
import { DEFAULT_LOCALE } from "constants/locales";
import { ValidationError } from "domain/errors/AppError";

import UpdateLocale from "application/use-cases/users/UpdateLocale";

import { catchError } from "test/helpers/assertions";

const USER_ID = 5;

describe("UpdateLocale", () => {
    const makeDeps = () => ({
        userRepository: { updateLocale: jest.fn() },
    });

    it("should store a supported language", async () => {
        const deps = makeDeps();
        const useCase = new UpdateLocale(deps.userRepository);

        await useCase.execute(USER_ID, { locale: DEFAULT_LOCALE });

        expect(deps.userRepository.updateLocale).toHaveBeenCalledWith(
            USER_ID,
            DEFAULT_LOCALE,
        );
    });

    it("should throw a 400 ValidationError for a language the server has no copy for", async () => {
        const deps = makeDeps();
        const useCase = new UpdateLocale(deps.userRepository);

        const error = await catchError(
            useCase.execute(USER_ID, { locale: "fr" }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "locale: Must be one of: en, pl, ru, uk",
        );
        expect(deps.userRepository.updateLocale).not.toHaveBeenCalled();
    });
});
