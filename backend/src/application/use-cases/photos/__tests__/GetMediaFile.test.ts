import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";

import GetMediaFile from "application/use-cases/photos/GetMediaFile";

import { catchError } from "test/helpers/assertions";

const KEY = "0b1c2d3e-1111-2222-3333-444455556666";

function setup() {
    const mediaStorage = { locate: jest.fn() };
    const useCase = new GetMediaFile(mediaStorage);

    return { useCase, mediaStorage };
}

describe("GetMediaFile", () => {
    it("should resolve a generated file name to its stored file", async () => {
        const { useCase, mediaStorage } = setup();

        mediaStorage.locate.mockResolvedValue("/media/file.webp");

        const file = await useCase.execute(`${KEY}-400.webp`);

        expect(file).toEqual({
            path: "/media/file.webp",
            contentType: "image/webp",
        });
        expect(mediaStorage.locate).toHaveBeenCalledWith(`${KEY}-400.webp`);
    });

    it("should type the link preview variant as a JPEG", async () => {
        const { useCase, mediaStorage } = setup();

        mediaStorage.locate.mockResolvedValue("/media/file.jpg");

        const file = await useCase.execute(`${KEY}-og.jpg`);

        expect(file.contentType).toBe("image/jpeg");
    });

    it("should answer 404 when the file is not stored", async () => {
        const { useCase, mediaStorage } = setup();

        mediaStorage.locate.mockResolvedValue(null);

        const error = await catchError(useCase.execute(`${KEY}-1200.webp`));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.MEDIA_NOT_FOUND,
            404,
        );
    });

    it.each([
        "../../etc/passwd",
        `${KEY}-400.svg`,
        `${KEY}-800.webp`,
        `${KEY}-og.webp`,
        `${KEY}-400.jpg`,
        `${KEY.toUpperCase()}-400.webp`,
        ".env",
    ])("should never ask the storage for %s", async (fileName) => {
        const { useCase, mediaStorage } = setup();

        const error = await catchError(useCase.execute(fileName));

        expect(error).toBeInstanceOf(NotFoundError);
        expect(mediaStorage.locate).not.toHaveBeenCalled();
    });
});
