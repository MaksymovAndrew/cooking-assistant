import UpdateProfile from "application/use-cases/users/UpdateProfile";

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

    it("should throw a validation error for an empty name", async () => {
        const deps = makeDeps();
        const useCase = new UpdateProfile(deps.userRepository);

        await expect(
            useCase.execute(USER_ID, {
                name: "",
                surname: "Cook",
                avatar: null,
            }),
        ).rejects.toThrow();
        expect(deps.userRepository.updateProfile).not.toHaveBeenCalled();
    });

    it("should throw a validation error for an unknown avatar key", async () => {
        const deps = makeDeps();
        const useCase = new UpdateProfile(deps.userRepository);

        await expect(
            useCase.execute(USER_ID, {
                name: "Claude",
                surname: "Cook",
                avatar: "not-a-real-avatar",
            }),
        ).rejects.toThrow();
        expect(deps.userRepository.updateProfile).not.toHaveBeenCalled();
    });
});
