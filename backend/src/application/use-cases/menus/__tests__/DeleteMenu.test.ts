import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import PhotoCleanup from "application/media/PhotoCleanup";
import DeleteMenu from "application/use-cases/menus/DeleteMenu";

import { catchError } from "test/helpers/assertions";

function setup() {
    const menuRepository = { deleteById: jest.fn() };
    const photoRepository = { findKey: jest.fn(), listOwnedKeys: jest.fn() };
    const mediaStorage = { remove: jest.fn() };
    const useCase = new DeleteMenu(
        menuRepository,
        new PhotoCleanup(photoRepository, mediaStorage),
    );

    return { useCase, menuRepository, photoRepository, mediaStorage };
}

describe("DeleteMenu", () => {
    it("should throw a 400 ValidationError when the menu id is missing", async () => {
        const { useCase, menuRepository } = setup();

        const error = await catchError(useCase.execute(null, 7));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "ID is required",
        );
        expect(menuRepository.deleteById).not.toHaveBeenCalled();
    });

    it("should throw a 404 NotFoundError when the menu does not belong to the user", async () => {
        const { useCase, menuRepository } = setup();

        menuRepository.deleteById.mockResolvedValue(false);

        const error = await catchError(useCase.execute(9, 7));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.MENU_NOT_FOUND,
            404,
        );
    });

    it("should delete the menu when it belongs to the user", async () => {
        const { useCase, menuRepository } = setup();

        menuRepository.deleteById.mockResolvedValue(true);

        await useCase.execute(9, 7);

        expect(menuRepository.deleteById).toHaveBeenCalledWith(9, 7);
    });

    it("should remove the menu's cover once the menu is deleted", async () => {
        const { useCase, menuRepository, photoRepository, mediaStorage } =
            setup();

        photoRepository.findKey.mockResolvedValue("cover-key");
        menuRepository.deleteById.mockResolvedValue(true);

        await useCase.execute(9, 7);

        expect(photoRepository.findKey).toHaveBeenCalledWith(7, "menu", 9);
        expect(mediaStorage.remove).toHaveBeenCalledWith("cover-key");
    });

    it("should not touch storage when the menu has no cover", async () => {
        const { useCase, menuRepository, photoRepository, mediaStorage } =
            setup();

        photoRepository.findKey.mockResolvedValue(null);
        menuRepository.deleteById.mockResolvedValue(true);

        await useCase.execute(9, 7);

        expect(mediaStorage.remove).not.toHaveBeenCalled();
    });
});
