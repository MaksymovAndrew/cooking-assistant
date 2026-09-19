import type { Tag, TagRepository } from "domain/repositories/TagRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class GetTags {
    constructor(private tagRepository: Pick<TagRepository, "findByPerson">) {}

    async execute(personId: string | number): Promise<Tag[]> {
        const validPersonId = validate(idSchema, personId);

        return this.tagRepository.findByPerson(validPersonId);
    }
}
