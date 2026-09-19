import { ERROR_CODES } from "constants/errorCodes";
import { TAG_LIMITS } from "constants/tags";
import { ConflictError, NotFoundError } from "domain/errors/AppError";
import type { Tag, TagRepository } from "domain/repositories/TagRepository";

import { idSchema } from "application/validation/common.schemas";
import { createTagSchema } from "application/validation/tags.schemas";
import { validate } from "application/validation/validate";

export default class CreateTag {
    constructor(private tagRepository: Pick<TagRepository, "create">) {}

    async execute(personId: string | number, input: unknown): Promise<Tag> {
        const validPersonId = validate(idSchema, personId);
        const { name } = validate(createTagSchema, input);

        const result = await this.tagRepository.create(
            validPersonId,
            name,
            TAG_LIMITS.MAX_TAGS_PER_PERSON,
        );

        if (result.outcome === "person_not_found") {
            throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
        }

        if (result.outcome === "limit_reached") {
            throw new ConflictError(ERROR_CODES.TAG_LIMIT_REACHED);
        }

        if (result.outcome === "duplicate_name") {
            throw new ConflictError(ERROR_CODES.TAG_DUPLICATE_NAME);
        }

        return result.tag;
    }
}
