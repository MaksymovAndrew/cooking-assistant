import { ERROR_CODES } from "constants/errorCodes";
import {
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from "domain/errors/AppError";

import ChangePassword from "application/use-cases/users/ChangePassword";

import { catchError } from "test/helpers/assertions";

const USER_ID = 5;
const CURRENT_PASSWORD = "current-secret";
const NEW_PASSWORD = "new-secret1!";
const CURRENT_HASH = "hashed-current";
const STORED_CREDENTIALS = {
    id: USER_ID,
    password: CURRENT_HASH,
    session_version: 0,
};

function matchesCurrentPassword(plain: string, hash: string) {
    return Promise.resolve(plain === CURRENT_PASSWORD && hash === CURRENT_HASH);
}

function hashOf(plain: string) {
    return Promise.resolve(`hashed:${plain}`);
}

describe("ChangePassword", () => {
    const makeDeps = () => ({
        userRepository: {
            findCredentialsById: jest.fn(),
            updatePassword: jest.fn(),
        },
        passwordHasher: { compare: jest.fn(), hash: jest.fn() },
        tokenService: { generate: jest.fn() },
    });

    it("should hash and set the new password when the current password is correct", async () => {
        const deps = makeDeps();

        deps.userRepository.findCredentialsById.mockResolvedValue(
            STORED_CREDENTIALS,
        );
        deps.passwordHasher.compare.mockImplementation(matchesCurrentPassword);
        deps.passwordHasher.hash.mockImplementation(hashOf);
        deps.userRepository.updatePassword.mockResolvedValue(1);
        deps.tokenService.generate.mockReturnValue("fresh-token");
        const useCase = new ChangePassword(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const result = await useCase.execute(USER_ID, {
            currentPassword: CURRENT_PASSWORD,
            newPassword: NEW_PASSWORD,
        });

        expect(result).toEqual({ token: "fresh-token" });
        expect(deps.tokenService.generate).toHaveBeenCalledWith(USER_ID, 1);
        expect(deps.userRepository.updatePassword).toHaveBeenCalledWith(
            USER_ID,
            `hashed:${NEW_PASSWORD}`,
        );
    });

    it("should throw a 400 ValidationError when the new password matches the current password", async () => {
        const deps = makeDeps();

        deps.userRepository.findCredentialsById.mockResolvedValue(
            STORED_CREDENTIALS,
        );
        deps.passwordHasher.compare.mockResolvedValue(true);
        const useCase = new ChangePassword(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const error = await catchError(
            useCase.execute(USER_ID, {
                currentPassword: CURRENT_PASSWORD,
                newPassword: NEW_PASSWORD,
            }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.NEW_PASSWORD_SAME_AS_CURRENT,
            400,
        );
        expect(deps.passwordHasher.hash).not.toHaveBeenCalled();
        expect(deps.userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it("should throw a 401 UnauthorizedError when the current password is wrong", async () => {
        const deps = makeDeps();

        deps.userRepository.findCredentialsById.mockResolvedValue(
            STORED_CREDENTIALS,
        );
        deps.passwordHasher.compare.mockResolvedValue(false);
        const useCase = new ChangePassword(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const error = await catchError(
            useCase.execute(USER_ID, {
                currentPassword: "wrong-password",
                newPassword: NEW_PASSWORD,
            }),
        );

        expect(error).toBeAppError(
            UnauthorizedError,
            ERROR_CODES.CURRENT_PASSWORD_INCORRECT,
            401,
        );
        expect(deps.userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it("should throw a 404 NotFoundError when the user no longer exists", async () => {
        const deps = makeDeps();

        deps.userRepository.findCredentialsById.mockResolvedValue(null);
        const useCase = new ChangePassword(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const error = await catchError(
            useCase.execute(USER_ID, {
                currentPassword: CURRENT_PASSWORD,
                newPassword: NEW_PASSWORD,
            }),
        );

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.USER_NOT_FOUND,
            404,
        );
        expect(deps.passwordHasher.compare).not.toHaveBeenCalled();
    });

    it("should throw a 404 NotFoundError without a new session when the account is deleted before the password is saved", async () => {
        const deps = makeDeps();

        deps.userRepository.findCredentialsById.mockResolvedValue(
            STORED_CREDENTIALS,
        );
        deps.passwordHasher.compare.mockImplementation(matchesCurrentPassword);
        deps.passwordHasher.hash.mockImplementation(hashOf);
        deps.userRepository.updatePassword.mockResolvedValue(null);
        const useCase = new ChangePassword(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const error = await catchError(
            useCase.execute(USER_ID, {
                currentPassword: CURRENT_PASSWORD,
                newPassword: NEW_PASSWORD,
            }),
        );

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.USER_NOT_FOUND,
            404,
        );
        expect(deps.tokenService.generate).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError for a too-short new password", async () => {
        const deps = makeDeps();
        const useCase = new ChangePassword(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const error = await catchError(
            useCase.execute(USER_ID, {
                currentPassword: CURRENT_PASSWORD,
                newPassword: "short",
            }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "newPassword: Must be at least 8 characters and include a letter, a number and a special character",
        );
        expect(deps.userRepository.findCredentialsById).not.toHaveBeenCalled();
    });
});
