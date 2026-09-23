import { ERROR_CODES } from "constants/errorCodes";
import { DEFAULT_LOCALE } from "constants/locales";
import { ValidationError } from "domain/errors/AppError";

import RegisterUser from "application/use-cases/users/RegisterUser";

import { catchError } from "test/helpers/assertions";

const HASHED_PASSWORD = "hashed-secret";
const EMAIL = "bob@example.com";
const TOKEN = "session-token";

describe("RegisterUser", () => {
    const makeDeps = () => ({
        userRepository: { create: jest.fn() },
        passwordHasher: { hash: jest.fn() },
        tokenService: { generate: jest.fn() },
    });

    it("should hash the password, create a user with the hashed password, and log them in", async () => {
        const deps = makeDeps();

        deps.passwordHasher.hash.mockResolvedValue(HASHED_PASSWORD);
        deps.userRepository.create.mockResolvedValue({
            id: 5,
            session_version: 0,
        });
        deps.tokenService.generate.mockReturnValue(TOKEN);
        const useCase = new RegisterUser(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const result = await useCase.execute(
            {
                name: "Bob",
                surname: "Cook",
                login: "bob",
                email: EMAIL,
                password: "secret1!",
            },
            DEFAULT_LOCALE,
        );

        expect(deps.passwordHasher.hash).toHaveBeenCalledWith("secret1!");
        expect(deps.userRepository.create).toHaveBeenCalledWith({
            name: "Bob",
            surname: "Cook",
            login: "bob",
            email: EMAIL,
            password: HASHED_PASSWORD,
            locale: DEFAULT_LOCALE,
        });
        expect(deps.tokenService.generate).toHaveBeenCalledWith(5, 0);
        expect(result).toEqual({ token: TOKEN });
    });

    it("should trim whitespace from name, surname and login before creating the user", async () => {
        const deps = makeDeps();

        deps.passwordHasher.hash.mockResolvedValue(HASHED_PASSWORD);
        deps.userRepository.create.mockResolvedValue({
            id: 5,
            session_version: 0,
        });
        const useCase = new RegisterUser(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        await useCase.execute(
            {
                name: " Bob",
                surname: "Cook ",
                login: " bob ",
                email: EMAIL,
                password: "secret1!",
            },
            DEFAULT_LOCALE,
        );

        expect(deps.userRepository.create).toHaveBeenCalledWith({
            name: "Bob",
            surname: "Cook",
            login: "bob",
            email: EMAIL,
            password: HASHED_PASSWORD,
            locale: DEFAULT_LOCALE,
        });
    });

    it("should throw a 400 ValidationError when password is too short", async () => {
        const deps = makeDeps();
        const useCase = new RegisterUser(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const error = await catchError(
            useCase.execute(
                {
                    name: "Bob",
                    surname: "Cook",
                    login: "bob",
                    email: EMAIL,
                    password: "",
                },
                DEFAULT_LOCALE,
            ),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "password: Password must be at least 8 characters and include a letter, a number, and a special character",
        );
        expect(deps.passwordHasher.hash).not.toHaveBeenCalled();
        expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when the email is not a valid address", async () => {
        const deps = makeDeps();
        const useCase = new RegisterUser(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const error = await catchError(
            useCase.execute(
                {
                    name: "Bob",
                    surname: "Cook",
                    login: "bob",
                    email: "not-an-email",
                    password: "secret1!",
                },
                DEFAULT_LOCALE,
            ),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "email: Email must be a valid email address",
        );
        expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it("should lowercase the email before creating the user", async () => {
        const deps = makeDeps();

        deps.passwordHasher.hash.mockResolvedValue(HASHED_PASSWORD);
        deps.userRepository.create.mockResolvedValue({
            id: 5,
            session_version: 0,
        });
        const useCase = new RegisterUser(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        await useCase.execute(
            {
                name: "Bob",
                surname: "Cook",
                login: "bob",
                email: "Bob@Example.com",
                password: "secret1!",
            },
            DEFAULT_LOCALE,
        );

        expect(deps.userRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ email: EMAIL }),
        );
    });
});
