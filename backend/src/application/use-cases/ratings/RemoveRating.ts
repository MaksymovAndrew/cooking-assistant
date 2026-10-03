import type {
    RatingRepository,
    RatingTarget,
} from "domain/repositories/RatingRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

// idempotent: removing a missing vote, even on a deleted record, is a no-op
export default class RemoveRating {
    constructor(
        private ratingRepository: Pick<RatingRepository, "remove">,
        private target: RatingTarget,
    ) {}

    async execute(
        personId: string | number,
        targetId: string | number,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validTargetId = validate(idSchema, targetId);

        await this.ratingRepository.remove(
            validPersonId,
            this.target,
            validTargetId,
        );
    }
}
