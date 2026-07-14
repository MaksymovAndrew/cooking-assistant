import { UnauthorizedError, ValidationError } from "domain/errors/AppError";

import ConfirmPasswordReset from "application/use-cases/users/ConfirmPasswordReset";

import { catchError } from "test/helpers/assertions";

const TOKEN = "reset-token";
const NEW_PASSWORD = "new-secret1!";
const HASHED_PASSWORD = "hashed-new-secret";
const CURRENT_HASHED_PASSWORD = "hashed-current-secret";

describe("ConfirmPasswordReset", () => {
    const makeDeps = () => ({
        userRepository: {
            updatePassword: jest.fn(),
            findCredentialsById: jest.fn(),
        },
        passwordHasher: { compare: jest.fn(), hash: jest.fn() },
        tokenService: { verifyPurposeToken: jest.fn() },
    });

    it("should hash and set the new password when the token is valid and still bound to the current password", async () => {
        const deps = makeDeps();

        deps.tokenService.verifyPurposeToken.mockReturnValue(5);
        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: 5,
            password: CURRENT_HASHED_PASSWORD,
        });
        deps.passwordHasher.compare.mockResolvedValue(false);
        deps.passwordHasher.hash.mockResolvedValue(HASHED_PASSWORD);
        const useCase = new ConfirmPasswordReset(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        await useCase.execute({ token: TOKEN, newPassword: NEW_PASSWORD });

        expect(deps.tokenService.verifyPurposeToken).toHaveBeenNthCalledWith(
            1,
            TOKEN,
            "password-reset",
        );
        expect(deps.tokenService.verifyPurposeToken).toHaveBeenNthCalledWith(
            2,
            TOKEN,
            "password-reset",
            CURRENT_HASHED_PASSWORD,
        );
        expect(deps.passwordHasher.compare).toHaveBeenCalledWith(
            NEW_PASSWORD,
            CURRENT_HASHED_PASSWORD,
        );
        expect(deps.passwordHasher.hash).toHaveBeenCalledWith(NEW_PASSWORD);
        expect(deps.userRepository.updatePassword).toHaveBeenCalledWith(
            5,
            HASHED_PASSWORD,
        );
    });

    it("should throw a 400 ValidationError when the new password matches the current password", async () => {
        const deps = makeDeps();

        deps.tokenService.verifyPurposeToken.mockReturnValue(5);
        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: 5,
            password: CURRENT_HASHED_PASSWORD,
        });
        deps.passwordHasher.compare.mockResolvedValue(true);
        const useCase = new ConfirmPasswordReset(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const error = await catchError(
            useCase.execute({ token: TOKEN, newPassword: NEW_PASSWORD }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "New password must be different from your current password",
            400,
        );
        expect(deps.passwordHasher.hash).not.toHaveBeenCalled();
        expect(deps.userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it("should throw a 401 UnauthorizedError for an invalid or expired token", async () => {
        const deps = makeDeps();

        deps.tokenService.verifyPurposeToken.mockReturnValue(null);
        const useCase = new ConfirmPasswordReset(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const error = await catchError(
            useCase.execute({ token: TOKEN, newPassword: NEW_PASSWORD }),
        );

        expect(error).toBeAppError(
            UnauthorizedError,
            "This link is invalid or has expired",
            401,
        );
        expect(deps.userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it("should throw a 401 UnauthorizedError when the token has already been used (password hash no longer matches)", async () => {
        const deps = makeDeps();

        deps.tokenService.verifyPurposeToken.mockImplementation(
            (_token: string, _purpose: string, bindingSource?: string) =>
                bindingSource == null ? 5 : null,
        );
        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: 5,
            password: CURRENT_HASHED_PASSWORD,
        });
        const useCase = new ConfirmPasswordReset(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const error = await catchError(
            useCase.execute({ token: TOKEN, newPassword: NEW_PASSWORD }),
        );

        expect(error).toBeAppError(
            UnauthorizedError,
            "This link is invalid or has expired",
            401,
        );
        expect(deps.userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError for a too-short new password", async () => {
        const deps = makeDeps();
        const useCase = new ConfirmPasswordReset(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        await expect(
            useCase.execute({ token: TOKEN, newPassword: "short" }),
        ).rejects.toThrow();
        expect(deps.tokenService.verifyPurposeToken).not.toHaveBeenCalled();
    });
});
