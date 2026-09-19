import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type { TagRepository } from "domain/repositories/TagRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class DeleteTag {
    constructor(private tagRepository: Pick<TagRepository, "delete">) {}

    async execute(
        personId: string | number,
        tagId: string | number,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validTagId = validate(idSchema, tagId);

        const deleted = await this.tagRepository.delete(
            validPersonId,
            validTagId,
        );

        if (!deleted) {
            throw new NotFoundError(ERROR_CODES.TAG_NOT_FOUND);
        }
    }
}
