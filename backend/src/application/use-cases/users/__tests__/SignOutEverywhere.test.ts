import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";

import SignOutEverywhere from "application/use-cases/users/SignOutEverywhere";

import { catchError } from "test/helpers/assertions";

const USER_ID = 5;

describe("SignOutEverywhere", () => {
    const makeDeps = () => ({
        userRepository: { revokeSessions: jest.fn() },
        tokenService: { generate: jest.fn() },
    });

    it("should raise the session version and re-issue the current session under it", async () => {
        const deps = makeDeps();

        deps.userRepository.revokeSessions.mockResolvedValue(3);
        deps.tokenService.generate.mockReturnValue("fresh-token");
        const useCase = new SignOutEverywhere(
            deps.userRepository,
            deps.tokenService,
        );

        const result = await useCase.execute(USER_ID);

        expect(result).toEqual({ token: "fresh-token" });
        expect(deps.userRepository.revokeSessions).toHaveBeenCalledWith(
            USER_ID,
        );
        expect(deps.tokenService.generate).toHaveBeenCalledWith(USER_ID, 3);
    });

    it("should throw a 404 NotFoundError when the account is gone", async () => {
        const deps = makeDeps();

        deps.userRepository.revokeSessions.mockResolvedValue(null);
        const useCase = new SignOutEverywhere(
            deps.userRepository,
            deps.tokenService,
        );

        const error = await catchError(useCase.execute(USER_ID));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.USER_NOT_FOUND,
            404,
        );
        expect(deps.tokenService.generate).not.toHaveBeenCalled();
    });
});
