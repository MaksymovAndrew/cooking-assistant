import { DEFAULT_LOCALE } from "constants/locales";

import UpdateLocale from "application/use-cases/users/UpdateLocale";

const USER_ID = 5;

describe("UpdateLocale", () => {
    const makeDeps = () => ({
        userRepository: { updateLocale: jest.fn() },
    });

    it("should store a supported language", async () => {
        const deps = makeDeps();
        const useCase = new UpdateLocale(deps.userRepository);

        await useCase.execute(USER_ID, { locale: DEFAULT_LOCALE });

        expect(deps.userRepository.updateLocale).toHaveBeenCalledWith(
            USER_ID,
            DEFAULT_LOCALE,
        );
    });

    it("should throw a validation error for a language the server has no copy for", async () => {
        const deps = makeDeps();
        const useCase = new UpdateLocale(deps.userRepository);

        await expect(
            useCase.execute(USER_ID, { locale: "fr" }),
        ).rejects.toThrow();
        expect(deps.userRepository.updateLocale).not.toHaveBeenCalled();
    });
});
