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
        deps.userRepository.create.mockResolvedValue({ id: 5 });
        deps.tokenService.generate.mockReturnValue(TOKEN);
        const useCase = new RegisterUser(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        const result = await useCase.execute({
            name: "Bob",
            surname: "Cook",
            login: "bob",
            email: EMAIL,
            password: "secret1!",
        });

        expect(deps.passwordHasher.hash).toHaveBeenCalledWith("secret1!");
        expect(deps.userRepository.create).toHaveBeenCalledWith({
            name: "Bob",
            surname: "Cook",
            login: "bob",
            email: EMAIL,
            password: HASHED_PASSWORD,
        });
        expect(deps.tokenService.generate).toHaveBeenCalledWith(5);
        expect(result).toEqual({ token: TOKEN });
    });

    it("should trim whitespace from name, surname and login before creating the user", async () => {
        const deps = makeDeps();

        deps.passwordHasher.hash.mockResolvedValue(HASHED_PASSWORD);
        deps.userRepository.create.mockResolvedValue({ id: 5 });
        const useCase = new RegisterUser(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        await useCase.execute({
            name: " Bob",
            surname: "Cook ",
            login: " bob ",
            email: EMAIL,
            password: "secret1!",
        });

        expect(deps.userRepository.create).toHaveBeenCalledWith({
            name: "Bob",
            surname: "Cook",
            login: "bob",
            email: EMAIL,
            password: HASHED_PASSWORD,
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
            useCase.execute({
                name: "Bob",
                surname: "Cook",
                login: "bob",
                email: EMAIL,
                password: "",
            }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "password: Password must be at least 8 characters and include a letter, a number, and a special character",
            400,
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
            useCase.execute({
                name: "Bob",
                surname: "Cook",
                login: "bob",
                email: "not-an-email",
                password: "secret1!",
            }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "email: Email must be a valid email address",
            400,
        );
        expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it("should lowercase the email before creating the user", async () => {
        const deps = makeDeps();

        deps.passwordHasher.hash.mockResolvedValue(HASHED_PASSWORD);
        deps.userRepository.create.mockResolvedValue({ id: 5 });
        const useCase = new RegisterUser(
            deps.userRepository,
            deps.passwordHasher,
            deps.tokenService,
        );

        await useCase.execute({
            name: "Bob",
            surname: "Cook",
            login: "bob",
            email: "Bob@Example.com",
            password: "secret1!",
        });

        expect(deps.userRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ email: EMAIL }),
        );
    });
});
