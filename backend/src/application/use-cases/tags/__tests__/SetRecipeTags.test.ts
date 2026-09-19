import { ERROR_CODES } from "constants/errorCodes";
import { TAG_LIMITS } from "constants/tags";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import SetRecipeTags from "application/use-cases/tags/SetRecipeTags";

import { catchError } from "test/helpers/assertions";

function setup() {
    const tagRepository = { setRecipeTags: jest.fn() };
    const useCase = new SetRecipeTags(tagRepository);

    return { useCase, tagRepository };
}

describe("SetRecipeTags", () => {
    it("should replace the recipe's tags", async () => {
        const { useCase, tagRepository } = setup();

        tagRepository.setRecipeTags.mockResolvedValue("saved");

        await useCase.execute(7, "4", { tag_ids: [1, 2] });

        expect(tagRepository.setRecipeTags).toHaveBeenCalledWith(7, 4, [1, 2]);
    });

    it("should accept an empty list, which clears the recipe's tags", async () => {
        const { useCase, tagRepository } = setup();

        tagRepository.setRecipeTags.mockResolvedValue("saved");

        await useCase.execute(7, 4, { tag_ids: [] });

        expect(tagRepository.setRecipeTags).toHaveBeenCalledWith(7, 4, []);
    });

    it.each([
        ["recipe_not_found", ERROR_CODES.RECIPE_NOT_FOUND],
        ["tags_not_found", ERROR_CODES.TAG_NOT_FOUND],
    ])("should map the %s outcome to a 404", async (outcome, code) => {
        const { useCase, tagRepository } = setup();

        tagRepository.setRecipeTags.mockResolvedValue(outcome);

        const error = await catchError(useCase.execute(7, 4, { tag_ids: [1] }));

        expect(error).toBeAppError(NotFoundError, code, 404);
    });

    it("should throw a 400 ValidationError for duplicate tag ids", async () => {
        const { useCase, tagRepository } = setup();

        const error = await catchError(
            useCase.execute(7, 4, { tag_ids: [1, 1] }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "tag_ids: Tag IDs must be unique",
        );
        expect(tagRepository.setRecipeTags).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError above the per-recipe limit", async () => {
        const { useCase, tagRepository } = setup();
        const tooMany = Array.from(
            { length: TAG_LIMITS.MAX_TAGS_PER_RECIPE + 1 },
            (_value, index) => index + 1,
        );

        const error = await catchError(
            useCase.execute(7, 4, { tag_ids: tooMany }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            `tag_ids: Tag IDs must contain at most ${TAG_LIMITS.MAX_TAGS_PER_RECIPE} items`,
        );
        expect(tagRepository.setRecipeTags).not.toHaveBeenCalled();
    });
});
