import { ERROR_CODES, type ErrorCode } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";
import type {
    RatingRepository,
    RatingTarget,
} from "domain/repositories/RatingRepository";

import { idSchema } from "application/validation/common.schemas";
import { rateSchema } from "application/validation/rating.schemas";
import { validate } from "application/validation/validate";

const NOT_FOUND_BY_TARGET = {
    recipe: ERROR_CODES.RECIPE_NOT_FOUND,
    menu: ERROR_CODES.MENU_NOT_FOUND,
} satisfies Record<RatingTarget, ErrorCode>;

// a repeat vote replaces the previous one, so PUT stays idempotent
export default class RateRecord {
    constructor(
        private ratingRepository: Pick<RatingRepository, "rate">,
        private target: RatingTarget,
    ) {}

    async execute(
        personId: string | number,
        targetId: string | number,
        body: unknown,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validTargetId = validate(idSchema, targetId);
        const { value } = validate(rateSchema, body);

        const outcome = await this.ratingRepository.rate(
            validPersonId,
            this.target,
            validTargetId,
            value,
        );

        if (outcome === "not_found") {
            throw new NotFoundError(NOT_FOUND_BY_TARGET[this.target]);
        }

        if (outcome === "own_record") {
            throw new ValidationError(ERROR_CODES.RATING_OWN_RECORD);
        }
    }
}
