import { ERROR_MESSAGES } from "constants/errorMessages";
import { UnauthorizedError } from "domain/errors/AppError";

import LoginUser from "application/use-cases/users/LoginUser";

import { catchError } from "test/helpers/assertions";

function setup() {
    const userRepository = {
        findByLogin: jest.fn(),
        findCredentialsByEmail: jest.fn(),
    };
    const passwordHasher = { compare: jest.fn() };
    const tokenService = { generate: jest.fn() };
    const useCase = new LoginUser(userRepository, passwordHasher, tokenService);

    return {
        useCase,
        userRepository,
        passwordHasher,
        tokenService,
    };
}

function makeCredentials(overrides = {}) {
    return {
        login: "bob",
        password: "x",
        ...overrides,
    };
}

describe("LoginUser", () => {
    it("should throw a 401 UnauthorizedError when the user does not exist", async () => {
        const { useCase, userRepository } = setup();

        userRepository.findByLogin.mockResolvedValue(null);

        const error = await catchError(useCase.execute(makeCredentials()));

        expect(error).toBeAppError(
            UnauthorizedError,
            ERROR_MESSAGES.INVALID_LOGIN_OR_PASSWORD,
            401,
        );
    });

    it("should throw a 401 UnauthorizedError when the password is wrong", async () => {
        const { useCase, userRepository, passwordHasher } = setup();

        userRepository.findByLogin.mockResolvedValue({
            id: 1,
            password: "hash",
        });
        passwordHasher.compare.mockResolvedValue(false);

        const error = await catchError(useCase.execute(makeCredentials()));

        expect(error).toBeAppError(
            UnauthorizedError,
            ERROR_MESSAGES.INVALID_LOGIN_OR_PASSWORD,
            401,
        );
    });

    it("should trim whitespace from the login before looking up the user", async () => {
        const { useCase, userRepository, passwordHasher, tokenService } =
            setup();

        userRepository.findByLogin.mockResolvedValue({
            id: 7,
            password: "hash",
        });
        passwordHasher.compare.mockResolvedValue(true);
        tokenService.generate.mockReturnValue("jwt-token");

        await useCase.execute(makeCredentials({ login: " bob " }));

        expect(userRepository.findByLogin).toHaveBeenCalledWith("bob");
    });

    it("should return a token for valid credentials", async () => {
        const { useCase, userRepository, passwordHasher, tokenService } =
            setup();

        userRepository.findByLogin.mockResolvedValue({
            id: 7,
            password: "hash",
        });
        passwordHasher.compare.mockResolvedValue(true);
        tokenService.generate.mockReturnValue("jwt-token");

        const result = await useCase.execute(
            makeCredentials({ password: "secret" }),
        );

        expect(passwordHasher.compare).toHaveBeenCalledWith("secret", "hash");
        expect(tokenService.generate).toHaveBeenCalledWith(7);
        expect(result).toEqual({ token: "jwt-token" });
    });

    it("should log in with an email identifier by looking up credentials by email", async () => {
        const { useCase, userRepository, passwordHasher, tokenService } =
            setup();

        userRepository.findCredentialsByEmail.mockResolvedValue({
            id: 9,
            password: "hash",
        });
        passwordHasher.compare.mockResolvedValue(true);
        tokenService.generate.mockReturnValue("jwt-token");

        const result = await useCase.execute(
            makeCredentials({ login: "Bob@Example.com" }),
        );

        expect(userRepository.findCredentialsByEmail).toHaveBeenCalledWith(
            "bob@example.com",
        );
        expect(userRepository.findByLogin).not.toHaveBeenCalled();
        expect(tokenService.generate).toHaveBeenCalledWith(9);
        expect(result).toEqual({ token: "jwt-token" });
    });

    it("should throw a 401 UnauthorizedError when no account matches the email identifier", async () => {
        const { useCase, userRepository } = setup();

        userRepository.findCredentialsByEmail.mockResolvedValue(null);

        const error = await catchError(
            useCase.execute(makeCredentials({ login: "nobody@example.com" })),
        );

        expect(error).toBeAppError(
            UnauthorizedError,
            ERROR_MESSAGES.INVALID_LOGIN_OR_PASSWORD,
            401,
        );
    });
});
