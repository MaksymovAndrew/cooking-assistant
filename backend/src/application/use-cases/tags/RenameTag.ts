import { ERROR_CODES } from "constants/errorCodes";
import { ConflictError, NotFoundError } from "domain/errors/AppError";
import type { TagRepository } from "domain/repositories/TagRepository";

import { idSchema } from "application/validation/common.schemas";
import { renameTagSchema } from "application/validation/tags.schemas";
import { validate } from "application/validation/validate";

export default class RenameTag {
    constructor(private tagRepository: Pick<TagRepository, "rename">) {}

    async execute(
        personId: string | number,
        tagId: string | number,
        input: unknown,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validTagId = validate(idSchema, tagId);
        const { name } = validate(renameTagSchema, input);

        const outcome = await this.tagRepository.rename(
            validPersonId,
            validTagId,
            name,
        );

        if (outcome === "duplicate_name") {
            throw new ConflictError(ERROR_CODES.TAG_DUPLICATE_NAME);
        }

        if (outcome === "not_found") {
            throw new NotFoundError(ERROR_CODES.TAG_NOT_FOUND);
        }
    }
}
