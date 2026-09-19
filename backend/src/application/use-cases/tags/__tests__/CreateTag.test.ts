import { ERROR_CODES } from "constants/errorCodes";
import { TAG_LIMITS } from "constants/tags";
import {
    ConflictError,
    NotFoundError,
    ValidationError,
} from "domain/errors/AppError";

import CreateTag from "application/use-cases/tags/CreateTag";

import { catchError } from "test/helpers/assertions";

const TAG_NAME = "Quick";

function setup() {
    const tagRepository = { create: jest.fn() };
    const useCase = new CreateTag(tagRepository);

    return { useCase, tagRepository };
}

describe("CreateTag", () => {
    it("should create the tag with a trimmed name", async () => {
        const { useCase, tagRepository } = setup();
        const tag = { id: 1, name: TAG_NAME };

        tagRepository.create.mockResolvedValue({ outcome: "created", tag });

        const result = await useCase.execute(7, { name: "  Quick  " });

        expect(result).toEqual(tag);
        expect(tagRepository.create).toHaveBeenCalledWith(
            7,
            TAG_NAME,
            TAG_LIMITS.MAX_TAGS_PER_PERSON,
        );
    });

    it.each([
        ["duplicate_name", ERROR_CODES.TAG_DUPLICATE_NAME],
        ["limit_reached", ERROR_CODES.TAG_LIMIT_REACHED],
    ])("should map the %s outcome to a 409", async (outcome, code) => {
        const { useCase, tagRepository } = setup();

        tagRepository.create.mockResolvedValue({ outcome, tag: null });

        const error = await catchError(useCase.execute(7, { name: TAG_NAME }));

        expect(error).toBeAppError(ConflictError, code, 409);
    });

    it("should throw a 404 NotFoundError when the account no longer exists", async () => {
        const { useCase, tagRepository } = setup();

        tagRepository.create.mockResolvedValue({
            outcome: "person_not_found",
            tag: null,
        });

        const error = await catchError(useCase.execute(7, { name: TAG_NAME }));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.USER_NOT_FOUND,
            404,
        );
    });

    it("should throw a 400 ValidationError for a blank name without touching the repository", async () => {
        const { useCase, tagRepository } = setup();

        const error = await catchError(useCase.execute(7, { name: "   " }));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "name: Name cannot be empty",
        );
        expect(tagRepository.create).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError for a name over the length limit", async () => {
        const { useCase, tagRepository } = setup();

        const error = await catchError(
            useCase.execute(7, {
                name: "a".repeat(TAG_LIMITS.MAX_NAME_LENGTH + 1),
            }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            `name: Name must be at most ${TAG_LIMITS.MAX_NAME_LENGTH} characters`,
        );
        expect(tagRepository.create).not.toHaveBeenCalled();
    });
});
