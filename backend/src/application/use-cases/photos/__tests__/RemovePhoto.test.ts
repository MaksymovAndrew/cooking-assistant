import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type { PhotoTarget } from "domain/repositories/PhotoRepository";

import RemovePhoto from "application/use-cases/photos/RemovePhoto";

import { catchError } from "test/helpers/assertions";

function setup(target: PhotoTarget = "recipe") {
    const photoRepository = { replace: jest.fn() };
    const mediaStorage = { remove: jest.fn() };
    const useCase = new RemovePhoto(photoRepository, mediaStorage, target);

    return { useCase, photoRepository, mediaStorage };
}

describe("RemovePhoto", () => {
    it("should clear the record and delete its files", async () => {
        const { useCase, photoRepository, mediaStorage } = setup();

        photoRepository.replace.mockResolvedValue({ previousKey: "old-key" });

        await useCase.execute(7, "5");

        expect(photoRepository.replace).toHaveBeenCalledWith(
            7,
            "recipe",
            5,
            null,
        );
        expect(mediaStorage.remove).toHaveBeenCalledWith("old-key");
    });

    it("should succeed quietly when the record has no photo", async () => {
        const { useCase, photoRepository, mediaStorage } = setup();

        photoRepository.replace.mockResolvedValue({ previousKey: null });

        await useCase.execute(7, 5);

        expect(mediaStorage.remove).not.toHaveBeenCalled();
    });

    it("should answer 404 when the account no longer exists", async () => {
        const { useCase, photoRepository } = setup("avatar");

        photoRepository.replace.mockResolvedValue(null);

        const error = await catchError(useCase.execute(7, 7));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.USER_NOT_FOUND,
            404,
        );
    });
});
