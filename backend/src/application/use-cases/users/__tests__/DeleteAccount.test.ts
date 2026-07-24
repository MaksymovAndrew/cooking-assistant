import { NotFoundError, UnauthorizedError } from "domain/errors/AppError";

import DeleteAccount from "application/use-cases/users/DeleteAccount";

import { catchError } from "test/helpers/assertions";

const USER_ID = 5;
const PASSWORD = "current-secret";
const CURRENT_HASH = "hashed-current";

describe("DeleteAccount", () => {
    const makeDeps = () => ({
        userRepository: {
            findCredentialsById: jest.fn(),
            delete: jest.fn(),
        },
        passwordHasher: { compare: jest.fn() },
    });

    it("should delete the account when the password is correct", async () => {
        const deps = makeDeps();

        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: USER_ID,
            password: CURRENT_HASH,
        });
        deps.passwordHasher.compare.mockResolvedValue(true);
        const useCase = new DeleteAccount(
            deps.userRepository,
            deps.passwordHasher,
        );

        await useCase.execute(USER_ID, { password: PASSWORD });

        expect(deps.passwordHasher.compare).toHaveBeenCalledWith(
            PASSWORD,
            CURRENT_HASH,
        );
        expect(deps.userRepository.delete).toHaveBeenCalledWith(USER_ID);
    });

    it("should throw a 401 UnauthorizedError when the password is wrong", async () => {
        const deps = makeDeps();

        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: USER_ID,
            password: CURRENT_HASH,
        });
        deps.passwordHasher.compare.mockResolvedValue(false);
        const useCase = new DeleteAccount(
            deps.userRepository,
            deps.passwordHasher,
        );

        const error = await catchError(
            useCase.execute(USER_ID, { password: "wrong-password" }),
        );

        expect(error).toBeAppError(
            UnauthorizedError,
            "Current password is incorrect",
            401,
        );
        expect(deps.userRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw a 404 NotFoundError when the user no longer exists", async () => {
        const deps = makeDeps();

        deps.userRepository.findCredentialsById.mockResolvedValue(null);
        const useCase = new DeleteAccount(
            deps.userRepository,
            deps.passwordHasher,
        );

        const error = await catchError(
            useCase.execute(USER_ID, { password: PASSWORD }),
        );

        expect(error).toBeAppError(NotFoundError, "User not found", 404);
        expect(deps.passwordHasher.compare).not.toHaveBeenCalled();
    });

    it("should throw a validation error for an empty password", async () => {
        const deps = makeDeps();
        const useCase = new DeleteAccount(
            deps.userRepository,
            deps.passwordHasher,
        );

        await expect(
            useCase.execute(USER_ID, { password: "" }),
        ).rejects.toThrow();
        expect(deps.userRepository.findCredentialsById).not.toHaveBeenCalled();
    });
});
