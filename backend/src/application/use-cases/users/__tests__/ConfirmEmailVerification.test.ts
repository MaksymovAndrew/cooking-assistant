import { UnauthorizedError } from "domain/errors/AppError";

import ConfirmEmailVerification from "application/use-cases/users/ConfirmEmailVerification";

import { catchError } from "test/helpers/assertions";

const USER_ID = 5;
const TOKEN = "verify-token";

describe("ConfirmEmailVerification", () => {
    const makeDeps = () => ({
        userRepository: { markEmailVerified: jest.fn() },
        tokenService: { verifyPurposeToken: jest.fn() },
    });

    it("should mark the email verified for a valid token", async () => {
        const deps = makeDeps();

        deps.tokenService.verifyPurposeToken.mockReturnValue(USER_ID);
        const useCase = new ConfirmEmailVerification(
            deps.userRepository,
            deps.tokenService,
        );

        await useCase.execute({ token: TOKEN });

        expect(deps.tokenService.verifyPurposeToken).toHaveBeenCalledWith(
            TOKEN,
            "verify-email",
        );
        expect(deps.userRepository.markEmailVerified).toHaveBeenCalledWith(
            USER_ID,
        );
    });

    it("should throw a 401 UnauthorizedError for an invalid or expired token", async () => {
        const deps = makeDeps();

        deps.tokenService.verifyPurposeToken.mockReturnValue(null);
        const useCase = new ConfirmEmailVerification(
            deps.userRepository,
            deps.tokenService,
        );

        const error = await catchError(useCase.execute({ token: TOKEN }));

        expect(error).toBeAppError(
            UnauthorizedError,
            "This link is invalid or has expired",
            401,
        );
        expect(deps.userRepository.markEmailVerified).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when the token is missing", async () => {
        const deps = makeDeps();
        const useCase = new ConfirmEmailVerification(
            deps.userRepository,
            deps.tokenService,
        );

        await expect(useCase.execute({})).rejects.toThrow();
        expect(deps.tokenService.verifyPurposeToken).not.toHaveBeenCalled();
    });
});
