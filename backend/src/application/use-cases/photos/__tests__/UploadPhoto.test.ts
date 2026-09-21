import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";
import type { PhotoTarget } from "domain/repositories/PhotoRepository";

import { IMAGE_VARIANTS } from "application/media/mediaFiles";
import UploadPhoto from "application/use-cases/photos/UploadPhoto";

import { catchError } from "test/helpers/assertions";

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const VARIANTS = IMAGE_VARIANTS.map((spec) => ({
    spec,
    data: Buffer.from(spec.name),
}));
const UUID = /^[0-9a-f-]{36}$/;

function setup(target: PhotoTarget = "recipe") {
    const photoRepository = { replace: jest.fn() };
    const imageProcessor = { toVariants: jest.fn() };
    const mediaStorage = { save: jest.fn(), remove: jest.fn() };
    const useCase = new UploadPhoto(
        photoRepository,
        imageProcessor,
        mediaStorage,
        target,
    );

    imageProcessor.toVariants.mockResolvedValue(VARIANTS);

    return { useCase, photoRepository, imageProcessor, mediaStorage };
}

describe("UploadPhoto", () => {
    it("should store every variant and point the record at the new key", async () => {
        const { useCase, photoRepository, imageProcessor, mediaStorage } =
            setup();

        photoRepository.replace.mockResolvedValue({ previousKey: null });

        const key = await useCase.execute(7, "5", JPEG);

        expect(key).toMatch(UUID);
        expect(imageProcessor.toVariants).toHaveBeenCalledWith(
            JPEG,
            IMAGE_VARIANTS,
        );
        expect(mediaStorage.save).toHaveBeenCalledWith(key, VARIANTS);
        expect(photoRepository.replace).toHaveBeenCalledWith(
            7,
            "recipe",
            5,
            key,
        );
        expect(mediaStorage.remove).not.toHaveBeenCalled();
    });

    it("should remove the photo it replaced", async () => {
        const { useCase, photoRepository, mediaStorage } = setup();

        photoRepository.replace.mockResolvedValue({ previousKey: "old-key" });

        await useCase.execute(7, 5, JPEG);

        expect(mediaStorage.remove).toHaveBeenCalledWith("old-key");
    });

    it("should refuse bytes that are not a supported image before decoding them", async () => {
        const { useCase, imageProcessor, mediaStorage } = setup();

        const error = await catchError(
            useCase.execute(7, 5, Buffer.from("<svg/>", "utf8")),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.MEDIA_UNSUPPORTED_TYPE,
            400,
        );
        expect(imageProcessor.toVariants).not.toHaveBeenCalled();
        expect(mediaStorage.save).not.toHaveBeenCalled();
    });

    it("should refuse a body that is not raw bytes at all", async () => {
        const { useCase } = setup();

        const error = await catchError(useCase.execute(7, 5, { photo: "x" }));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.MEDIA_UNSUPPORTED_TYPE,
            400,
        );
    });

    it("should refuse an image the decoder rejects", async () => {
        const { useCase, imageProcessor, mediaStorage } = setup();

        imageProcessor.toVariants.mockResolvedValue(null);

        const error = await catchError(useCase.execute(7, 5, JPEG));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.MEDIA_UNREADABLE,
            400,
        );
        expect(mediaStorage.save).not.toHaveBeenCalled();
    });

    it("should discard the new files and answer 404 when the recipe is not the user's", async () => {
        const { useCase, photoRepository, mediaStorage } = setup("recipe");

        photoRepository.replace.mockResolvedValue(null);

        const error = await catchError(useCase.execute(7, 5, JPEG));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.RECIPE_NOT_FOUND,
            404,
        );

        const [savedKey] = mediaStorage.save.mock.calls[0] as [string];

        expect(mediaStorage.remove).toHaveBeenCalledWith(savedKey);
    });

    it("should answer 404 with the menu code when the menu is not the user's", async () => {
        const { useCase, photoRepository } = setup("menu");

        photoRepository.replace.mockResolvedValue(null);

        const error = await catchError(useCase.execute(7, 5, JPEG));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.MENU_NOT_FOUND,
            404,
        );
    });

    it("should discard the new files when the record update fails", async () => {
        const { useCase, photoRepository, mediaStorage } = setup();

        photoRepository.replace.mockRejectedValue(new Error("db down"));

        await expect(useCase.execute(7, 5, JPEG)).rejects.toThrow("db down");

        const [savedKey] = mediaStorage.save.mock.calls[0] as [string];

        expect(mediaStorage.remove).toHaveBeenCalledWith(savedKey);
    });

    it("should refuse an invalid record id before touching the image", async () => {
        const { useCase, imageProcessor } = setup();

        const error = await catchError(useCase.execute(7, "abc", JPEG));

        expect(error).toBeInstanceOf(ValidationError);
        expect(imageProcessor.toVariants).not.toHaveBeenCalled();
    });
});
