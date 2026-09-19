import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";

import DeleteTag from "application/use-cases/tags/DeleteTag";

import { catchError } from "test/helpers/assertions";

function setup() {
    const tagRepository = { delete: jest.fn() };
    const useCase = new DeleteTag(tagRepository);

    return { useCase, tagRepository };
}

describe("DeleteTag", () => {
    it("should delete the tag", async () => {
        const { useCase, tagRepository } = setup();

        tagRepository.delete.mockResolvedValue(true);

        await useCase.execute("7", "3");

        expect(tagRepository.delete).toHaveBeenCalledWith(7, 3);
    });

    it("should throw a 404 NotFoundError for another user's tag", async () => {
        const { useCase, tagRepository } = setup();

        tagRepository.delete.mockResolvedValue(false);

        const error = await catchError(useCase.execute(7, 3));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.TAG_NOT_FOUND,
            404,
        );
    });
});
