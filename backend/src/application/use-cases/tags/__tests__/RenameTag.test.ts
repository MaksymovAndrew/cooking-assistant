import { ERROR_CODES } from "constants/errorCodes";
import { ConflictError, NotFoundError } from "domain/errors/AppError";

import RenameTag from "application/use-cases/tags/RenameTag";

import { catchError } from "test/helpers/assertions";

const NEW_NAME = "Weeknight";

function setup() {
    const tagRepository = { rename: jest.fn() };
    const useCase = new RenameTag(tagRepository);

    return { useCase, tagRepository };
}

describe("RenameTag", () => {
    it("should rename the tag", async () => {
        const { useCase, tagRepository } = setup();

        tagRepository.rename.mockResolvedValue("renamed");

        await useCase.execute(7, "3", { name: NEW_NAME });

        expect(tagRepository.rename).toHaveBeenCalledWith(7, 3, NEW_NAME);
    });

    it("should throw a 409 ConflictError when the name is already used", async () => {
        const { useCase, tagRepository } = setup();

        tagRepository.rename.mockResolvedValue("duplicate_name");

        const error = await catchError(
            useCase.execute(7, 3, { name: NEW_NAME }),
        );

        expect(error).toBeAppError(
            ConflictError,
            ERROR_CODES.TAG_DUPLICATE_NAME,
            409,
        );
    });

    it("should throw a 404 NotFoundError for another user's tag", async () => {
        const { useCase, tagRepository } = setup();

        tagRepository.rename.mockResolvedValue("not_found");

        const error = await catchError(
            useCase.execute(7, 3, { name: NEW_NAME }),
        );

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.TAG_NOT_FOUND,
            404,
        );
    });
});
