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
const NEW_HASH = "hashed-new";

describe("ChangePassword", () => {
    const makeDeps = () => ({
        userRepository: {
            findCredentialsById: jest.fn(),
            updatePassword: jest.fn(),
        },
        passwordHasher: { compare: jest.fn(), hash: jest.fn() },
    });

    it("should hash and set the new password when the current password is correct", async () => {
        const deps = makeDeps();

        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: USER_ID,
            password: CURRENT_HASH,
        });
        deps.passwordHasher.compare
            .mockResolvedValueOnce(true) // current password check
            .mockResolvedValueOnce(false); // new-password-same-as-current check
        deps.passwordHasher.hash.mockResolvedValue(NEW_HASH);
        const useCase = new ChangePassword(
            deps.userRepository,
            deps.passwordHasher,
        );

        await useCase.execute(USER_ID, {
            currentPassword: CURRENT_PASSWORD,
            newPassword: NEW_PASSWORD,
        });

        expect(deps.passwordHasher.compare).toHaveBeenNthCalledWith(
            1,
            CURRENT_PASSWORD,
            CURRENT_HASH,
        );
        expect(deps.passwordHasher.compare).toHaveBeenNthCalledWith(
            2,
            NEW_PASSWORD,
            CURRENT_HASH,
        );
        expect(deps.passwordHasher.hash).toHaveBeenCalledWith(NEW_PASSWORD);
        expect(deps.userRepository.updatePassword).toHaveBeenCalledWith(
            USER_ID,
            NEW_HASH,
        );
    });

    it("should throw a 400 ValidationError when the new password matches the current password", async () => {
        const deps = makeDeps();

        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: USER_ID,
            password: CURRENT_HASH,
        });
        deps.passwordHasher.compare.mockResolvedValue(true);
        const useCase = new ChangePassword(
            deps.userRepository,
            deps.passwordHasher,
        );

        const error = await catchError(
            useCase.execute(USER_ID, {
                currentPassword: CURRENT_PASSWORD,
                newPassword: NEW_PASSWORD,
            }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "New password must be different from your current password",
            400,
        );
        expect(deps.passwordHasher.hash).not.toHaveBeenCalled();
        expect(deps.userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it("should throw a 401 UnauthorizedError when the current password is wrong", async () => {
        const deps = makeDeps();

        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: USER_ID,
            password: CURRENT_HASH,
        });
        deps.passwordHasher.compare.mockResolvedValue(false);
        const useCase = new ChangePassword(
            deps.userRepository,
            deps.passwordHasher,
        );

        const error = await catchError(
            useCase.execute(USER_ID, {
                currentPassword: "wrong-password",
                newPassword: NEW_PASSWORD,
            }),
        );

        expect(error).toBeAppError(
            UnauthorizedError,
            "Current password is incorrect",
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
        );

        const error = await catchError(
            useCase.execute(USER_ID, {
                currentPassword: CURRENT_PASSWORD,
                newPassword: NEW_PASSWORD,
            }),
        );

        expect(error).toBeAppError(NotFoundError, "User not found", 404);
        expect(deps.passwordHasher.compare).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError for a too-short new password", async () => {
        const deps = makeDeps();
        const useCase = new ChangePassword(
            deps.userRepository,
            deps.passwordHasher,
        );

        await expect(
            useCase.execute(USER_ID, {
                currentPassword: CURRENT_PASSWORD,
                newPassword: "short",
            }),
        ).rejects.toThrow();
        expect(deps.userRepository.findCredentialsById).not.toHaveBeenCalled();
    });
});
