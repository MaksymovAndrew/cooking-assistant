import { AVATAR_KEYS } from "constants/avatarKeys";
import { ERROR_CODES } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";

import UpdateProfile from "application/use-cases/users/UpdateProfile";

import { catchError } from "test/helpers/assertions";

const USER_ID = 5;

describe("UpdateProfile", () => {
    const makeDeps = () => ({
        userRepository: { updateProfile: jest.fn() },
    });

    it("should update the name, surname, and avatar", async () => {
        const deps = makeDeps();
        const useCase = new UpdateProfile(deps.userRepository);

        await useCase.execute(USER_ID, {
            name: "Claude",
            surname: "Cook",
            avatar: "tomato",
        });

        expect(deps.userRepository.updateProfile).toHaveBeenCalledWith(
            USER_ID,
            { name: "Claude", surname: "Cook", avatar: "tomato" },
        );
    });

    it("should allow clearing the avatar back to null", async () => {
        const deps = makeDeps();
        const useCase = new UpdateProfile(deps.userRepository);

        await useCase.execute(USER_ID, {
            name: "Claude",
            surname: "Cook",
            avatar: null,
        });

        expect(deps.userRepository.updateProfile).toHaveBeenCalledWith(
            USER_ID,
            { name: "Claude", surname: "Cook", avatar: null },
        );
    });

    it("should throw a 400 ValidationError for an empty name", async () => {
        const deps = makeDeps();
        const useCase = new UpdateProfile(deps.userRepository);

        const error = await catchError(
            useCase.execute(USER_ID, {
                name: "",
                surname: "Cook",
                avatar: null,
            }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "name: Cannot be empty",
        );
        expect(deps.userRepository.updateProfile).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError for an unknown avatar key", async () => {
        const deps = makeDeps();
        const useCase = new UpdateProfile(deps.userRepository);

        const error = await catchError(
            useCase.execute(USER_ID, {
                name: "Claude",
                surname: "Cook",
                avatar: "not-a-real-avatar",
            }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            `avatar: Must be one of: ${AVATAR_KEYS.join(", ")}`,
        );
        expect(deps.userRepository.updateProfile).not.toHaveBeenCalled();
    });
});
