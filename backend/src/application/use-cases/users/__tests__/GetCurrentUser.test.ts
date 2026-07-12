import { ERROR_MESSAGES } from "constants/errorMessages";
import { NotFoundError } from "domain/errors/AppError";

import GetCurrentUser from "application/use-cases/users/GetCurrentUser";

import { catchError } from "test/helpers/assertions";

describe("GetCurrentUser", () => {
    it("should return the user from the repository", async () => {
        const user = { id: 7, name: "Bob", surname: "Cook", login: "bob" };
        const userRepository = { findById: jest.fn().mockResolvedValue(user) };
        const useCase = new GetCurrentUser(userRepository);

        const result = await useCase.execute(7);

        expect(userRepository.findById).toHaveBeenCalledWith(7);
        expect(result).toEqual(user);
    });

    it("should throw a 404 NotFoundError when the user no longer exists", async () => {
        const userRepository = { findById: jest.fn().mockResolvedValue(null) };
        const useCase = new GetCurrentUser(userRepository);

        const error = await catchError(useCase.execute(7));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_MESSAGES.USER_NOT_FOUND,
            404,
        );
    });
});
