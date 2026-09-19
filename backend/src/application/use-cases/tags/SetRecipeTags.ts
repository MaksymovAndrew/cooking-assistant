import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type { TagRepository } from "domain/repositories/TagRepository";

import { idSchema } from "application/validation/common.schemas";
import { setRecipeTagsSchema } from "application/validation/tags.schemas";
import { validate } from "application/validation/validate";

export default class SetRecipeTags {
    constructor(private tagRepository: Pick<TagRepository, "setRecipeTags">) {}

    async execute(
        personId: string | number,
        recipeId: string | number,
        input: unknown,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validRecipeId = validate(idSchema, recipeId);
        const { tag_ids } = validate(setRecipeTagsSchema, input);

        const outcome = await this.tagRepository.setRecipeTags(
            validPersonId,
            validRecipeId,
            tag_ids,
        );

        if (outcome === "recipe_not_found") {
            throw new NotFoundError(ERROR_CODES.RECIPE_NOT_FOUND);
        }

        if (outcome === "tags_not_found") {
            throw new NotFoundError(ERROR_CODES.TAG_NOT_FOUND);
        }
    }
}
