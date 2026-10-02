import { COOKING_UNDO_WINDOW_MS } from "constants/cooking";
import { ERROR_CODES } from "constants/errorCodes";
import { ConflictError, NotFoundError } from "domain/errors/AppError";
import type { PantryConsumptionRepository } from "domain/repositories/PantryConsumptionRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class UndoCooking {
    constructor(
        private pantryConsumptionRepository: Pick<
            PantryConsumptionRepository,
            "undo"
        >,
    ) {}

    async execute(
        personId: string | number,
        consumptionId: string | number,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validConsumptionId = validate(idSchema, consumptionId);
        const result = await this.pantryConsumptionRepository.undo(
            validPersonId,
            validConsumptionId,
            COOKING_UNDO_WINDOW_MS,
        );

        if (result === "not_found") {
            throw new NotFoundError(ERROR_CODES.CONSUMPTION_NOT_FOUND);
        }

        if (result === "unavailable") {
            throw new ConflictError(ERROR_CODES.UNDO_EXPIRED);
        }

        if (result === "person_not_found") {
            throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
        }
    }
}
